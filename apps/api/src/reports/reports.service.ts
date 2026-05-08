import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChecklistItemStatus, ChecklistType, EventStatus, MaterialStatus } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async dashboard(companyId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalMaterials,
      availableMaterials,
      totalEvents,
      eventsThisMonth,
      activeEvents,
      completedEvents,
    ] = await this.prisma.$transaction([
      this.prisma.material.count({ where: { companyId, deletedAt: null } }),
      this.prisma.material.count({
        where: { companyId, deletedAt: null, status: MaterialStatus.AVAILABLE },
      }),
      this.prisma.event.count({ where: { companyId } }),
      this.prisma.event.count({ where: { companyId, createdAt: { gte: startOfMonth } } }),
      this.prisma.event.count({ where: { companyId, status: EventStatus.IN_PROGRESS } }),
      this.prisma.event.count({ where: { companyId, status: EventStatus.COMPLETED } }),
    ]);

    return {
      materials: { total: totalMaterials, available: availableMaterials },
      events: {
        total: totalEvents,
        thisMonth: eventsThisMonth,
        active: activeEvents,
        completed: completedEvents,
      },
    };
  }

  async eventReport(companyId: string, eventId: string) {
    const event = await this.prisma.event.findFirst({
      where: { id: eventId, companyId },
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

    const allItems = event.materials.flatMap((em) => em.checklist);
    const departure = allItems.filter((i) => i.type === ChecklistType.DEPARTURE);
    const ret = allItems.filter((i) => i.type === ChecklistType.RETURN);

    const summarize = (items: { status: ChecklistItemStatus }[]) => ({
      total: items.length,
      confirmed: items.filter((i) => i.status === ChecklistItemStatus.CONFIRMED).length,
      pending: items.filter((i) => i.status === ChecklistItemStatus.PENDING).length,
      missing: items.filter((i) => i.status === ChecklistItemStatus.MISSING).length,
      damaged: items.filter((i) => i.status === ChecklistItemStatus.DAMAGED).length,
    });

    return {
      event: {
        id: event.id,
        name: event.name,
        status: event.status,
        startDate: event.startDate,
        returnDate: event.returnDate,
        location: event.location,
        client: event.client,
      },
      materials: event.materials.map((em) => ({
        material: { id: em.material.id, name: em.material.name, qrCode: em.material.qrCode },
        qtyAllocated: em.qtyAllocated,
        departure: summarize(em.checklist.filter((i) => i.type === ChecklistType.DEPARTURE)),
        return: summarize(em.checklist.filter((i) => i.type === ChecklistType.RETURN)),
      })),
      totals: {
        departure: summarize(departure),
        return: summarize(ret),
      },
    };
  }

  async materialUsage(companyId: string, materialId: string) {
    const material = await this.prisma.material.findFirst({
      where: { id: materialId, companyId, deletedAt: null },
    });
    if (!material) throw new NotFoundException('Material not found');

    const allocations = await this.prisma.eventMaterial.findMany({
      where: { materialId },
      include: {
        event: { select: { id: true, name: true, status: true, startDate: true, returnDate: true } },
        checklist: true,
      },
      orderBy: { event: { startDate: 'desc' } },
      take: 20,
    });

    return {
      material: {
        id: material.id,
        name: material.name,
        category: material.category,
        qrCode: material.qrCode,
        totalQty: material.totalQty,
      },
      usageCount: allocations.length,
      history: allocations.map((a) => ({
        event: a.event,
        qtyAllocated: a.qtyAllocated,
        departureConfirmed: a.checklist.filter(
          (i) => i.type === ChecklistType.DEPARTURE && i.status === ChecklistItemStatus.CONFIRMED,
        ).length,
        returnConfirmed: a.checklist.filter(
          (i) => i.type === ChecklistType.RETURN && i.status === ChecklistItemStatus.CONFIRMED,
        ).length,
      })),
    };
  }
}
