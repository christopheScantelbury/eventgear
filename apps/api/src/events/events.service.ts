import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { AddMaterialDto } from './dto/add-material.dto';
import { UpdateAllocationDto } from './dto/update-allocation.dto';
import { ListEventsDto } from './dto/list-events.dto';
import { EventStatus } from '@prisma/client';

@Injectable()
export class EventsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(companyId: string, dto: CreateEventDto) {

    // Se customerId, valida e preenche client com o nome
    let resolvedClient = dto.client;
    if (dto.customerId) {
      const customer = await this.prisma.customer.findFirst({
        where: { id: dto.customerId, companyId, deletedAt: null },
      });
      if (!customer) throw new BadRequestException('Customer not found');
      resolvedClient = customer.name;
    }

    return this.prisma.event.create({
      data: {
        companyId,
        customerId: dto.customerId,
        name: dto.name,
        startDate: new Date(dto.startDate),
        returnDate: new Date(dto.returnDate),
        location: dto.location,
        client: resolvedClient,
        notes: dto.notes,
        totalAmount: dto.totalAmount,
        discount: dto.discount,
        paid: dto.paid ?? false,
      },
      include: {
        materials: { include: { material: true } },
        customer: true,
      },
    });
  }

  async findAll(companyId: string, query: ListEventsDto) {
    const { status, search, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = { companyId };
    if (status) where.status = status;
    if (search) where.name = { contains: search, mode: 'insensitive' };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startDate: 'asc' },
        include: {
          materials: {
            include: { material: { select: { id: true, name: true, category: true, qrCode: true } } },
          },
        },
      }),
      this.prisma.event.count({ where }),
    ]);

    return {
      items,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    };
  }

  async findOne(companyId: string, id: string) {
    const event = await this.prisma.event.findFirst({
      where: { id, companyId },
      include: {
        materials: {
          include: {
            material: true,
            checklist: true,
          },
        },
      },
    });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async update(companyId: string, id: string, dto: UpdateEventDto) {
    await this.findOne(companyId, id);

    return this.prisma.event.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.startDate && { startDate: new Date(dto.startDate) }),
        ...(dto.returnDate && { returnDate: new Date(dto.returnDate) }),
        ...(dto.location !== undefined && { location: dto.location }),
        ...(dto.client !== undefined && { client: dto.client }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.status && { status: dto.status }),
      },
      include: { materials: { include: { material: true } } },
    });
  }

  async remove(companyId: string, id: string) {
    const event = await this.findOne(companyId, id);
    if (event.status === EventStatus.IN_PROGRESS) {
      throw new BadRequestException('Cannot cancel an event that is in progress');
    }
    return this.prisma.event.update({
      where: { id },
      data: { status: EventStatus.CANCELLED },
    });
  }

  async addMaterial(companyId: string, eventId: string, dto: AddMaterialDto) {
    const event = await this.findOne(companyId, eventId);
    if (event.status === EventStatus.CANCELLED || event.status === EventStatus.COMPLETED) {
      throw new BadRequestException('Cannot modify a completed or cancelled event');
    }

    const material = await this.prisma.material.findFirst({
      where: { id: dto.materialId, companyId, deletedAt: null },
    });
    if (!material) throw new NotFoundException('Material not found');

    if (dto.qtyAllocated > material.totalQty) {
      throw new BadRequestException(
        `Requested qty (${dto.qtyAllocated}) exceeds material total (${material.totalQty})`,
      );
    }

    const existing = await this.prisma.eventMaterial.findUnique({
      where: { eventId_materialId: { eventId, materialId: dto.materialId } },
    });
    if (existing) throw new ConflictException('Material already added to this event');

    return this.prisma.eventMaterial.create({
      data: {
        eventId,
        materialId: dto.materialId,
        qtyAllocated: dto.qtyAllocated,
      },
      include: { material: true },
    });
  }

  async updateAllocation(
    companyId: string,
    eventId: string,
    materialId: string,
    dto: UpdateAllocationDto,
  ) {
    await this.findOne(companyId, eventId);

    const allocation = await this.prisma.eventMaterial.findUnique({
      where: { eventId_materialId: { eventId, materialId } },
      include: { material: true },
    });
    if (!allocation) throw new NotFoundException('Allocation not found');

    if (dto.qtyAllocated !== undefined && dto.qtyAllocated > allocation.material.totalQty) {
      throw new BadRequestException(
        `Requested qty (${dto.qtyAllocated}) exceeds material total (${allocation.material.totalQty})`,
      );
    }

    return this.prisma.eventMaterial.update({
      where: { eventId_materialId: { eventId, materialId } },
      data: { ...(dto.qtyAllocated !== undefined && { qtyAllocated: dto.qtyAllocated }) },
      include: { material: true },
    });
  }

  async removeMaterial(companyId: string, eventId: string, materialId: string) {
    await this.findOne(companyId, eventId);

    const allocation = await this.prisma.eventMaterial.findUnique({
      where: { eventId_materialId: { eventId, materialId } },
    });
    if (!allocation) throw new NotFoundException('Allocation not found');

    await this.prisma.eventMaterial.delete({
      where: { eventId_materialId: { eventId, materialId } },
    });
  }
}
