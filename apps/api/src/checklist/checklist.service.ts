import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GenerateChecklistDto } from './dto/generate-checklist.dto';
import { ScanQrDto } from './dto/scan-qr.dto';
import { UpdateChecklistItemDto } from './dto/update-checklist-item.dto';
import { ChecklistItemStatus, ChecklistType, EventStatus } from '@prisma/client';

@Injectable()
export class ChecklistService {
  constructor(private readonly prisma: PrismaService) {}

  async generate(companyId: string, eventId: string, dto: GenerateChecklistDto) {
    const event = await this.prisma.event.findFirst({
      where: { id: eventId, companyId },
      include: { materials: true },
    });
    if (!event) throw new NotFoundException('Event not found');

    if (event.status === EventStatus.CANCELLED) {
      throw new BadRequestException('Cannot generate checklist for a cancelled event');
    }

    // check if checklist of this type already exists
    const existing = await this.prisma.checklistItem.count({
      where: {
        eventMaterial: { eventId },
        type: dto.type,
      },
    });
    if (existing > 0) {
      throw new ConflictException(
        `Checklist of type ${dto.type} already generated for this event`,
      );
    }

    if (event.materials.length === 0) {
      throw new BadRequestException('Event has no materials allocated');
    }

    // create one ChecklistItem per unit per material
    const items = event.materials.flatMap((em) =>
      Array.from({ length: em.qtyAllocated }, () => ({
        eventMaterialId: em.id,
        type: dto.type,
        status: ChecklistItemStatus.PENDING,
      })),
    );

    await this.prisma.checklistItem.createMany({ data: items });

    // if generating DEPARTURE checklist, move event to IN_PROGRESS
    if (dto.type === ChecklistType.DEPARTURE && event.status === EventStatus.PLANNED) {
      await this.prisma.event.update({
        where: { id: eventId },
        data: { status: EventStatus.IN_PROGRESS },
      });
    }

    return this.findByEvent(companyId, eventId);
  }

  async findByEvent(companyId: string, eventId: string) {
    const event = await this.prisma.event.findFirst({
      where: { id: eventId, companyId },
    });
    if (!event) throw new NotFoundException('Event not found');

    const items = await this.prisma.checklistItem.findMany({
      where: { eventMaterial: { eventId } },
      include: {
        eventMaterial: {
          include: {
            material: { select: { id: true, name: true, category: true, qrCode: true } },
          },
        },
      },
      orderBy: [{ type: 'asc' }, { createdAt: 'asc' }],
    });

    const summary = {
      departure: this.summarize(items.filter((i) => i.type === ChecklistType.DEPARTURE)),
      return: this.summarize(items.filter((i) => i.type === ChecklistType.RETURN)),
    };

    return { items, summary };
  }

  async scan(companyId: string, userId: string, dto: ScanQrDto) {
    const material = await this.prisma.material.findFirst({
      where: { qrCode: dto.qrCode, companyId, deletedAt: null },
    });
    if (!material) throw new NotFoundException('Material not found for this QR code');

    const allocation = await this.prisma.eventMaterial.findFirst({
      where: { eventId: dto.eventId, materialId: material.id },
    });
    if (!allocation) {
      throw new NotFoundException('Material is not allocated to this event');
    }

    // find the first PENDING item of the requested type for this allocation
    const item = await this.prisma.checklistItem.findFirst({
      where: {
        eventMaterialId: allocation.id,
        type: dto.type,
        status: ChecklistItemStatus.PENDING,
      },
      orderBy: { createdAt: 'asc' },
    });

    if (!item) {
      throw new ConflictException(
        `All units of this material are already confirmed for ${dto.type}`,
      );
    }

    const updated = await this.prisma.checklistItem.update({
      where: { id: item.id },
      data: {
        status: ChecklistItemStatus.CONFIRMED,
        confirmedById: userId,
        scannedAt: new Date(),
      },
      include: {
        eventMaterial: {
          include: { material: { select: { id: true, name: true, qrCode: true } } },
        },
      },
    });

    // if all RETURN items are confirmed → complete the event
    if (dto.type === ChecklistType.RETURN) {
      await this.maybeCompleteEvent(dto.eventId);
    }

    return updated;
  }

  async updateItem(
    companyId: string,
    eventId: string,
    itemId: string,
    dto: UpdateChecklistItemDto,
  ) {
    const event = await this.prisma.event.findFirst({ where: { id: eventId, companyId } });
    if (!event) throw new NotFoundException('Event not found');

    const item = await this.prisma.checklistItem.findFirst({
      where: { id: itemId, eventMaterial: { eventId } },
    });
    if (!item) throw new NotFoundException('Checklist item not found');

    return this.prisma.checklistItem.update({
      where: { id: itemId },
      data: {
        ...(dto.status && { status: dto.status }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.status === ChecklistItemStatus.CONFIRMED && { scannedAt: new Date() }),
      },
      include: {
        eventMaterial: {
          include: { material: { select: { id: true, name: true, qrCode: true } } },
        },
      },
    });
  }

  private summarize(items: { status: ChecklistItemStatus }[]) {
    return {
      total: items.length,
      confirmed: items.filter((i) => i.status === ChecklistItemStatus.CONFIRMED).length,
      pending: items.filter((i) => i.status === ChecklistItemStatus.PENDING).length,
      missing: items.filter((i) => i.status === ChecklistItemStatus.MISSING).length,
      damaged: items.filter((i) => i.status === ChecklistItemStatus.DAMAGED).length,
    };
  }

  private async maybeCompleteEvent(eventId: string) {
    const pending = await this.prisma.checklistItem.count({
      where: {
        eventMaterial: { eventId },
        type: ChecklistType.RETURN,
        status: ChecklistItemStatus.PENDING,
      },
    });
    if (pending === 0) {
      await this.prisma.event.update({
        where: { id: eventId },
        data: { status: EventStatus.COMPLETED },
      });
    }
  }
}
