import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { ChecklistService } from './checklist.service';
import {
  ChecklistItemStatus,
  ChecklistType,
  EventStatus,
} from '@prisma/client';

const mockPrisma = {
  event: { findFirst: vi.fn(), update: vi.fn() },
  checklistItem: {
    count: vi.fn(),
    createMany: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
  },
  eventMaterial: { findFirst: vi.fn() },
};

const fakeEvent = {
  id: 'e1',
  companyId: 'c1',
  name: 'Show',
  status: EventStatus.PLANNED,
  materials: [{ id: 'em1', qtyAllocated: 2 }],
};

describe('ChecklistService', () => {
  let service: ChecklistService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ChecklistService(mockPrisma as any);
  });

  describe('generate', () => {
    it('lança NotFoundException se evento não existe', async () => {
      mockPrisma.event.findFirst.mockResolvedValue(null);
      await expect(
        service.generate('c1', 'e1', { type: ChecklistType.DEPARTURE }),
      ).rejects.toThrow(NotFoundException);
    });

    it('lança BadRequestException se evento cancelado', async () => {
      mockPrisma.event.findFirst.mockResolvedValue({
        ...fakeEvent,
        status: EventStatus.CANCELLED,
        materials: [],
      });
      await expect(
        service.generate('c1', 'e1', { type: ChecklistType.DEPARTURE }),
      ).rejects.toThrow(BadRequestException);
    });

    it('lança ConflictException se checklist já gerado', async () => {
      mockPrisma.event.findFirst.mockResolvedValue(fakeEvent);
      mockPrisma.checklistItem.count.mockResolvedValue(2);
      await expect(
        service.generate('c1', 'e1', { type: ChecklistType.DEPARTURE }),
      ).rejects.toThrow(ConflictException);
    });

    it('lança BadRequestException se nenhum material alocado', async () => {
      mockPrisma.event.findFirst.mockResolvedValue({ ...fakeEvent, materials: [] });
      mockPrisma.checklistItem.count.mockResolvedValue(0);
      await expect(
        service.generate('c1', 'e1', { type: ChecklistType.DEPARTURE }),
      ).rejects.toThrow(BadRequestException);
    });

    it('cria itens e muda evento para IN_PROGRESS ao gerar DEPARTURE', async () => {
      mockPrisma.event.findFirst
        .mockResolvedValueOnce(fakeEvent)
        .mockResolvedValueOnce(fakeEvent); // findByEvent call
      mockPrisma.checklistItem.count.mockResolvedValue(0);
      mockPrisma.checklistItem.createMany.mockResolvedValue({ count: 2 });
      mockPrisma.checklistItem.findMany.mockResolvedValue([]);

      await service.generate('c1', 'e1', { type: ChecklistType.DEPARTURE });

      expect(mockPrisma.checklistItem.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({ eventMaterialId: 'em1', type: ChecklistType.DEPARTURE }),
        ]),
      });
      expect(mockPrisma.event.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: EventStatus.IN_PROGRESS } }),
      );
    });
  });

  describe('scan', () => {
    it('lança NotFoundException se QR não pertence à empresa', async () => {
      mockPrisma.eventMaterial.findFirst.mockResolvedValue(null);
      // simulate material not found — intercept via prisma.material
      const prismaWithMaterial = {
        ...mockPrisma,
        material: { findFirst: vi.fn().mockResolvedValue(null) },
      };
      const svc = new ChecklistService(prismaWithMaterial as any);
      await expect(
        svc.scan('c1', 'u1', { qrCode: 'EGXXX', eventId: 'e1', type: ChecklistType.DEPARTURE }),
      ).rejects.toThrow(NotFoundException);
    });

    it('lança ConflictException se todas as unidades já confirmadas', async () => {
      const prismaWithAll = {
        ...mockPrisma,
        material: { findFirst: vi.fn().mockResolvedValue({ id: 'm1' }) },
        eventMaterial: { findFirst: vi.fn().mockResolvedValue({ id: 'em1' }) },
        checklistItem: {
          ...mockPrisma.checklistItem,
          findFirst: vi.fn().mockResolvedValue(null), // nenhum PENDING
        },
        event: { findFirst: vi.fn(), update: vi.fn() },
      };
      const svc = new ChecklistService(prismaWithAll as any);
      await expect(
        svc.scan('c1', 'u1', { qrCode: 'EGABC', eventId: 'e1', type: ChecklistType.DEPARTURE }),
      ).rejects.toThrow(ConflictException);
    });

    it('confirma item PENDING e retorna status CONFIRMED', async () => {
      const confirmedItem = {
        id: 'ci1',
        status: ChecklistItemStatus.CONFIRMED,
        scannedAt: new Date(),
        eventMaterial: { material: { id: 'm1', name: 'X', qrCode: 'EGABC' } },
      };
      const prismaWithAll = {
        ...mockPrisma,
        material: { findFirst: vi.fn().mockResolvedValue({ id: 'm1' }) },
        eventMaterial: { findFirst: vi.fn().mockResolvedValue({ id: 'em1' }) },
        checklistItem: {
          count: vi.fn().mockResolvedValue(1), // ainda tem pending
          findFirst: vi.fn().mockResolvedValue({ id: 'ci1', status: ChecklistItemStatus.PENDING }),
          update: vi.fn().mockResolvedValue(confirmedItem),
          createMany: vi.fn(),
          findMany: vi.fn(),
        },
        event: { findFirst: vi.fn(), update: vi.fn() },
      };
      const svc = new ChecklistService(prismaWithAll as any);
      const result = await svc.scan('c1', 'u1', {
        qrCode: 'EGABC',
        eventId: 'e1',
        type: ChecklistType.DEPARTURE,
      });
      expect(result.status).toBe(ChecklistItemStatus.CONFIRMED);
    });
  });
});
