import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import type * as BcryptType from 'bcryptjs';
import { AuthService } from './auth.service';

const mockPrisma = {
  user: { findUnique: vi.fn(), findUniqueOrThrow: vi.fn() },
  company: { create: vi.fn() },
};
const mockJwt = { signAsync: vi.fn().mockResolvedValue('token') };
const mockConfig = { getOrThrow: vi.fn().mockReturnValue('secret') };
const mockRedis = { set: vi.fn(), del: vi.fn() };
const mockMail = { sendWelcome: vi.fn().mockResolvedValue(undefined) };

let bcrypt: typeof BcryptType;
beforeAll(async () => {
  bcrypt = await import('bcryptjs');
});

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AuthService(
      mockPrisma as any,
      mockJwt as any,
      mockConfig as any,
      mockRedis as any,
      mockMail as any,
    );
  });

  describe('register', () => {
    it('lança ConflictException se email já existe', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: '1', email: 'a@b.com' });

      await expect(
        service.register({ companyName: 'X', name: 'Y', email: 'a@b.com', password: '12345678' }),
      ).rejects.toThrow(ConflictException);
    });

    it('cria company + user e retorna tokens', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.company.create.mockResolvedValue({
        id: 'company-1',
        name: 'Acme',
        users: [{ id: 'user-1', email: 'a@b.com', name: 'Test', role: 'ADMIN' }],
      });

      const result = await service.register({
        companyName: 'Acme',
        name: 'Test',
        email: 'a@b.com',
        password: 'password123',
      });

      expect(result).toEqual({ accessToken: 'token', refreshToken: 'token' });
      expect(mockRedis.set).toHaveBeenCalledWith('refresh:user-1', 'token', expect.any(Number));
    });
  });

  describe('login', () => {
    it('lança UnauthorizedException se usuário não existe', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(service.login({ email: 'x@x.com', password: '12345678' })).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('lança UnauthorizedException se senha errada', async () => {
      const hash = await bcrypt.hash('correta', 10);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: '1',
        companyId: 'c1',
        role: 'ADMIN',
        passwordHash: hash,
      });

      await expect(service.login({ email: 'x@x.com', password: 'errada' })).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('retorna tokens com credenciais válidas', async () => {
      const hash = await bcrypt.hash('correta', 10);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        companyId: 'c1',
        role: 'ADMIN',
        passwordHash: hash,
      });

      const result = await service.login({ email: 'x@x.com', password: 'correta' });
      expect(result).toEqual({ accessToken: 'token', refreshToken: 'token' });
    });
  });

  describe('logout', () => {
    it('remove refresh token do Redis', async () => {
      await service.logout('user-1');
      expect(mockRedis.del).toHaveBeenCalledWith('refresh:user-1');
    });
  });

  describe('me', () => {
    it('retorna dados do usuário sem senha', async () => {
      mockPrisma.user.findUniqueOrThrow.mockResolvedValue({ id: 'u1', name: 'Test' });
      const result = await service.me('u1');
      expect(result).toEqual({ id: 'u1', name: 'Test' });
    });
  });
});
