import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { ListCustomersDto } from './dto/list-customers.dto';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, dto: CreateCustomerDto) {
    return this.prisma.customer.create({
      data: {
        companyId,
        name: dto.name,
        type: dto.type ?? 'PJ',
        document: dto.document,
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
        city: dto.city,
        state: dto.state?.toUpperCase(),
        zipCode: dto.zipCode,
        notes: dto.notes,
        tags: dto.tags ?? [],
      },
    });
  }

  async list(companyId: string, dto: ListCustomersDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const where: Prisma.CustomerWhereInput = {
      companyId,
      deletedAt: null,
      ...(dto.search && {
        OR: [
          { name:     { contains: dto.search, mode: 'insensitive' } },
          { document: { contains: dto.search, mode: 'insensitive' } },
          { email:    { contains: dto.search, mode: 'insensitive' } },
          { phone:    { contains: dto.search, mode: 'insensitive' } },
        ],
      }),
      ...(dto.tag && { tags: { has: dto.tag } }),
    };

    const [items, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: 'asc' },
        include: { _count: { select: { events: true } } },
      }),
      this.prisma.customer.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async get(companyId: string, id: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, companyId, deletedAt: null },
      include: {
        events: {
          orderBy: { startDate: 'desc' },
          take: 50,
          select: {
            id: true,
            name: true,
            startDate: true,
            returnDate: true,
            status: true,
            totalAmount: true,
            paid: true,
          },
        },
        _count: { select: { events: true } },
      },
    });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async update(companyId: string, id: string, dto: UpdateCustomerDto) {
    const existing = await this.prisma.customer.findFirst({
      where: { id, companyId, deletedAt: null },
    });
    if (!existing) throw new NotFoundException('Customer not found');

    return this.prisma.customer.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.type && { type: dto.type }),
        ...(dto.document !== undefined && { document: dto.document }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.city !== undefined && { city: dto.city }),
        ...(dto.state !== undefined && { state: dto.state?.toUpperCase() }),
        ...(dto.zipCode !== undefined && { zipCode: dto.zipCode }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.tags !== undefined && { tags: dto.tags }),
      },
    });
  }

  async remove(companyId: string, id: string): Promise<void> {
    const existing = await this.prisma.customer.findFirst({
      where: { id, companyId, deletedAt: null },
    });
    if (!existing) throw new NotFoundException('Customer not found');

    // Soft delete (preserva eventos passados)
    await this.prisma.customer.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
