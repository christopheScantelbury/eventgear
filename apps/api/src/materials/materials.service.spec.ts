import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { MaterialsService } from './materials.service';
import { MaterialStatus } from '@prisma/client';

const mockPrisma = {
  material: {
    create: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    count: vi.fn(),
    update: vi.fn(),
  },
  materialPhoto: {
    create: vi.fn(),
    findFirst: vi.fn(),
    updateMany: vi.fn(),
    delete: vi.fn(),
  },
  $transaction: vi.fn(),
};

const mockStorage = {
  upload: vi.fn().mockResolvedValue('materials/abc.jpg'),
  getPublicUrl: vi.fn().mockReturnValue('http://minio/bucket/materials/abc.jpg'),
  delete: vi.fn(),
};

const fakeMaterial = {
  id: 'm1',
  companyId: 'c1',
  name: 'Caixa de Som',
  category: 'AUDIO',
  totalQty: 5,
  qrCode: 'EGABC123',
  status: MaterialStatus.AVAILABLE,
  deletedAt: null,
};

describe('MaterialsService', () => {
  let service: MaterialsService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new MaterialsService(mockPrisma as any, mockStorage as any);
  });

  describe('create', () => {
    it('cria material com QR code único', async () => {
      mockPrisma.material.create.mockResolvedValue({ ...fakeMaterial });
      await service.create('c1', {
        name: 'Caixa de Som',
        category: 'AUDIO',
        totalQty: 5,
      });
      expect(mockPrisma.material.create).toHaveBeenCalledOnce();
      const calledWith = mockPrisma.material.create.mock.calls[0][0];
      expect(calledWith.data.qrCode).toMatch(/^EG[A-F0-9]{16}$/);
    });
  });

  describe('findAll', () => {
    it('retorna lista paginada', async () => {
      mockPrisma.$transaction.mockResolvedValue([[fakeMaterial], 1]);
      const result = await service.findAll('c1', { page: 1, limit: 20 });
      expect(result.items).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('lança NotFoundException se material não existe', async () => {
      mockPrisma.material.findFirst.mockResolvedValue(null);
      await expect(service.findOne('c1', 'inexistente')).rejects.toThrow(NotFoundException);
    });

    it('retorna material quando existe', async () => {
      mockPrisma.material.findFirst.mockResolvedValue(fakeMaterial);
      const result = await service.findOne('c1', 'm1');
      expect(result.id).toBe('m1');
    });
  });

  describe('update', () => {
    it('atualiza material existente', async () => {
      mockPrisma.material.findFirst.mockResolvedValue(fakeMaterial);
      mockPrisma.material.update.mockResolvedValue({ ...fakeMaterial, name: 'Novo Nome' });
      const result = await service.update('c1', 'm1', { name: 'Novo Nome' });
      expect(result.name).toBe('Novo Nome');
    });
  });

  describe('remove', () => {
    it('aplica soft-delete (deletedAt)', async () => {
      mockPrisma.material.findFirst.mockResolvedValue(fakeMaterial);
      mockPrisma.material.update.mockResolvedValue({ ...fakeMaterial, deletedAt: new Date() });
      await service.remove('c1', 'm1');
      expect(mockPrisma.material.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ deletedAt: expect.any(Date) }) }),
      );
    });
  });

  describe('findByQrCode', () => {
    it('lança NotFoundException se QR não existe', async () => {
      mockPrisma.material.findFirst.mockResolvedValue(null);
      await expect(service.findByQrCode('c1', 'EGXXX')).rejects.toThrow(NotFoundException);
    });

    it('retorna material pelo QR code', async () => {
      mockPrisma.material.findFirst.mockResolvedValue(fakeMaterial);
      const result = await service.findByQrCode('c1', 'EGABC123');
      expect(result.qrCode).toBe('EGABC123');
    });
  });
});
