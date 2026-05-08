import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BillingGuardService } from '../billing/billing-guard.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private billingGuard: BillingGuardService,
  ) {}

  async create(companyId: string, dto: CreateUserDto) {
    await this.billingGuard.ensureCanCreate(companyId, 'user');
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already in use');

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        companyId,
        name: dto.name,
        email: dto.email,
        passwordHash,
        role: dto.role ?? UserRole.OPERATOR,
      },
      select: { id: true, name: true, email: true, role: true, companyId: true, createdAt: true },
    });

    return user;
  }

  async findAll(companyId: string) {
    return this.prisma.user.findMany({
      where: { companyId },
      select: { id: true, name: true, email: true, role: true, companyId: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async update(companyId: string, requesterId: string, targetId: string, dto: UpdateUserDto) {
    if (requesterId === targetId && dto.role) {
      throw new ForbiddenException('Cannot change your own role');
    }

    const user = await this.prisma.user.findFirst({ where: { id: targetId, companyId } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.user.update({
      where: { id: targetId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.role && { role: dto.role }),
      },
      select: { id: true, name: true, email: true, role: true, companyId: true, createdAt: true },
    });
  }

  async remove(companyId: string, requesterId: string, targetId: string): Promise<void> {
    if (requesterId === targetId) {
      throw new ForbiddenException('Cannot delete your own account');
    }

    const user = await this.prisma.user.findFirst({ where: { id: targetId, companyId } });
    if (!user) throw new NotFoundException('User not found');

    await this.prisma.user.delete({ where: { id: targetId } });
  }
}
