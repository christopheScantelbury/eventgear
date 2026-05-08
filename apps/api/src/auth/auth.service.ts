import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly REFRESH_TTL = 60 * 60 * 24 * 30; // 30 days

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private redis: RedisService,
    private mail: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email already in use');

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const company = await this.prisma.company.create({
      data: {
        name: dto.companyName,
        email: dto.email,
        phone: dto.companyPhone,
        users: {
          create: { name: dto.name, email: dto.email, passwordHash, role: 'ADMIN' },
        },
      },
      include: { users: true },
    });

    const user = company.users[0];
    // fire-and-forget — não bloqueia o registro
    this.mail.sendWelcome(user.email, user.name, company.name).catch(() => null);
    return this.issueTokens(user.id, company.id, user.role);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return this.issueTokens(user.id, user.companyId, user.role);
  }

  async refresh(userId: string, companyId: string, role: string) {
    return this.issueTokens(userId, companyId, role);
  }

  async logout(userId: string): Promise<void> {
    await this.redis.del(`refresh:${userId}`);
  }

  async me(userId: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, companyId: true, createdAt: true },
    });
  }

  private async issueTokens(userId: string, companyId: string, role: string) {
    const payload = { sub: userId, companyId, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.config.getOrThrow('JWT_SECRET'),
        expiresIn: '15m',
      }),
      this.jwt.signAsync(payload, {
        secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
        expiresIn: '30d',
      }),
    ]);

    await this.redis.set(`refresh:${userId}`, refreshToken, this.REFRESH_TTL);
    return { accessToken, refreshToken };
  }
}
