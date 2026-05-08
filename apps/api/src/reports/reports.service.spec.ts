import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { EventStatus, MaterialStatus } from '@prisma/client';

const mockPrisma = {
  material: { count: vi.fn(), findFirst: vi.fn() },
  event: { count: vi.fn(), findFirst: vi.fn() },
  eventMaterial: { findMany: vi.fn() },
  $transaction: vi.fn(),
};

describe('ReportsService', () => {
  let service: ReportsService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ReportsService(mockPrisma as any);
  });

  describe('dashboard', () => {
    it('retorna totais de materiais e eventos', async () => {
      mockPrisma.$transaction.mockResolvedValue([10, 8, 5, 2, 1, 3]);
      const result = await service.dashboard('c1');
      expect(result.materials.total).toBe(10);
      expect(result.materials.available).toBe(8);
      expect(result.events.total).toBe(5);
      expect(result.events.active).toBe(1);
      expect(result.events.completed).toBe(3);
    });
  });

  describe('eventReport', () => {
    it('lança NotFoundException se evento não existe', async () => {
      mockPrisma.event.findFirst.mockResolvedValue(null);
      await expect(service.eventReport('c1', 'e-inexistente')).rejects.toThrow(NotFoundException);
    });

    it('retorna relatório com totais de checklist', async () => {
      mockPrisma.event.findFirst.mockResolvedValue({
        id: 'e1',
        name: 'Show',
        status: EventStatus.COMPLETED,
        startDate: new Date(),
        returnDate: new Date(),
        location: 'SP',
        client: 'X',
        materials: [
          {
            id: 'em1',
            qtyAllocated: 1,
            material: { id: 'm1', name: 'Caixa', qrCode: 'EG001' },
            checklist: [],
          },
        ],
      });

      const result = await service.eventReport('c1', 'e1');
      expect(result.event.name).toBe('Show');
      expect(result.totals.departure.total).toBe(0);
    });
  });

  describe('materialUsage', () => {
    it('lança NotFoundException se material não existe', async () => {
      mockPrisma.material.findFirst.mockResolvedValue(null);
      await expect(service.materialUsage('c1', 'm-inexistente')).rejects.toThrow(NotFoundException);
    });

    it('retorna histórico de uso', async () => {
      mockPrisma.material.findFirst.mockResolvedValue({
        id: 'm1',
        name: 'Caixa',
        category: 'AUDIO',
        qrCode: 'EG001',
        totalQty: 3,
      });
      mockPrisma.eventMaterial.findMany.mockResolvedValue([
        {
          event: { id: 'e1', name: 'Show', status: EventStatus.COMPLETED, startDate: new Date(), returnDate: new Date() },
          qtyAllocated: 2,
          checklist: [],
        },
      ]);

      const result = await service.materialUsage('c1', 'm1');
      expect(result.usageCount).toBe(1);
      expect(result.history[0].qtyAllocated).toBe(2);
    });
  });
});
