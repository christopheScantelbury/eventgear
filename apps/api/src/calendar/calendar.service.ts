import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CalendarService {
  constructor(private prisma: PrismaService) {}

  /**
   * Para cada material da empresa, calcula:
   *  - totalQty
   *  - allocated: soma de qtyAllocated em eventos que se sobrepõem ao período
   *  - blocked: presença em CalendarBlock no período
   *  - available: totalQty - allocated (0 se blocked)
   */
  async availabilityInRange(params: {
    companyId: string;
    startDate: Date;
    endDate: Date;
    excludeEventId?: string;
  }) {
    const { companyId, startDate, endDate, excludeEventId } = params;

    const overlapWhere: Prisma.EventWhereInput = {
      companyId,
      ...(excludeEventId && { NOT: { id: excludeEventId } }),
      // Eventos cujo intervalo se sobrepõe ao [startDate, endDate]
      AND: [
        { startDate:  { lte: endDate }   },
        { returnDate: { gte: startDate } },
      ],
      status: { in: ['PLANNED', 'IN_PROGRESS'] },
    };

    const [materials, overlappingEvents, blocks] = await Promise.all([
      this.prisma.material.findMany({
        where: { companyId, deletedAt: null },
        select: {
          id: true,
          name: true,
          category: true,
          totalQty: true,
          status: true,
          dailyRentPrice: true,
        },
      }),
      this.prisma.event.findMany({
        where: overlapWhere,
        select: {
          id: true,
          name: true,
          startDate: true,
          returnDate: true,
          materials: { select: { materialId: true, qtyAllocated: true } },
        },
      }),
      this.prisma.calendarBlock.findMany({
        where: {
          material: { companyId },
          AND: [
            { startDate: { lte: endDate }   },
            { endDate:   { gte: startDate } },
          ],
        },
      }),
    ]);

    // Mapa: materialId → totalAlocado
    const allocatedByMaterial = new Map<string, number>();
    const eventsByMaterial = new Map<string, { eventId: string; eventName: string; qty: number }[]>();

    for (const ev of overlappingEvents) {
      for (const m of ev.materials) {
        allocatedByMaterial.set(
          m.materialId,
          (allocatedByMaterial.get(m.materialId) ?? 0) + m.qtyAllocated,
        );
        const arr = eventsByMaterial.get(m.materialId) ?? [];
        arr.push({ eventId: ev.id, eventName: ev.name, qty: m.qtyAllocated });
        eventsByMaterial.set(m.materialId, arr);
      }
    }

    const blockedMaterialIds = new Set(blocks.map((b) => b.materialId));

    return materials.map((m) => {
      const allocated = allocatedByMaterial.get(m.id) ?? 0;
      const blocked = blockedMaterialIds.has(m.id);
      const available = blocked ? 0 : Math.max(0, m.totalQty - allocated);
      return {
        materialId: m.id,
        name: m.name,
        category: m.category,
        totalQty: m.totalQty,
        allocated,
        available,
        blocked,
        dailyRentPrice: m.dailyRentPrice,
        conflicts: eventsByMaterial.get(m.id) ?? [],
      };
    });
  }

  /** Eventos no calendário (visualização mensal/semanal) */
  async eventsInRange(companyId: string, start: Date, end: Date) {
    return this.prisma.event.findMany({
      where: {
        companyId,
        AND: [
          { startDate:  { lte: end }   },
          { returnDate: { gte: start } },
        ],
      },
      select: {
        id: true,
        name: true,
        startDate: true,
        returnDate: true,
        location: true,
        status: true,
        client: true,
        customer: { select: { id: true, name: true } },
        totalAmount: true,
        paid: true,
        _count: { select: { materials: true } },
      },
      orderBy: { startDate: 'asc' },
    });
  }
}
