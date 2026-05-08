import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventStatus } from '@prisma/client';

const mockPrisma = {
  event: { create: vi.fn(), findMany: vi.fn(), findFirst: vi.fn(), count: vi.fn(), update: vi.fn() },
  material: { findFirst: vi.fn() },
  eventMaterial: { create: vi.fn(), findUnique: vi.fn(), update: vi.fn(), delete: vi.fn() },
  $transaction: vi.fn(),
};

const fakeEvent = {
  id: 'e1',
  companyId: 'c1',
  name: 'Show Rock',
  status: EventStatus.PLANNED,
  startDate: new Date(),
  returnDate: new Date(),
  materials: [],
};

const fakeMaterial = { id: 'm1', companyId: 'c1', totalQty: 5, deletedAt: null };

describe('EventsService', () => {
  let service: EventsService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new EventsService(mockPrisma as any);
  });

  describe('create', () => {
    it('cria evento com status PLANNED', async () => {
      mockPrisma.event.create.mockResolvedValue(fakeEvent);
      const result = await service.create('c1', {
        name: 'Show Rock',
        startDate: new Date().toISOString(),
        returnDate: new Date().toISOString(),
      });
      expect(result.status).toBe(EventStatus.PLANNED);
    });
  });

  describe('findAll', () => {
    it('retorna lista paginada com meta', async () => {
      mockPrisma.$transaction.mockResolvedValue([[fakeEvent], 1]);
      const result = await service.findAll('c1', { page: 1, limit: 20 });
      expect(result.items).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('lança NotFoundException se evento não existe', async () => {
      mockPrisma.event.findFirst.mockResolvedValue(null);
      await expect(service.findOne('c1', 'inexistente')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove (cancelar)', () => {
    it('lança BadRequestException se evento está IN_PROGRESS', async () => {
      mockPrisma.event.findFirst.mockResolvedValue({
        ...fakeEvent,
        status: EventStatus.IN_PROGRESS,
      });
      await expect(service.remove('c1', 'e1')).rejects.toThrow(BadRequestException);
    });

    it('cancela evento PLANNED com sucesso', async () => {
      mockPrisma.event.findFirst.mockResolvedValue(fakeEvent);
      mockPrisma.event.update.mockResolvedValue({ ...fakeEvent, status: EventStatus.CANCELLED });
      const result = await service.remove('c1', 'e1');
      expect(result.status).toBe(EventStatus.CANCELLED);
    });
  });

  describe('update', () => {
    it('atualiza evento existente', async () => {
      mockPrisma.event.findFirst.mockResolvedValue(fakeEvent);
      mockPrisma.event.update.mockResolvedValue({ ...fakeEvent, name: 'Show Atualizado' });
      const result = await service.update('c1', 'e1', { name: 'Show Atualizado' });
      expect(result.name).toBe('Show Atualizado');
    });
  });

  describe('addMaterial', () => {
    it('lança NotFoundException se material não existe', async () => {
      mockPrisma.event.findFirst.mockResolvedValue(fakeEvent);
      mockPrisma.material.findFirst.mockResolvedValue(null);
      await expect(service.addMaterial('c1', 'e1', { materialId: 'm1', qtyAllocated: 1 })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('lança BadRequestException se qty excede totalQty', async () => {
      mockPrisma.event.findFirst.mockResolvedValue(fakeEvent);
      mockPrisma.material.findFirst.mockResolvedValue(fakeMaterial);
      mockPrisma.eventMaterial.findUnique.mockResolvedValue(null);
      await expect(service.addMaterial('c1', 'e1', { materialId: 'm1', qtyAllocated: 10 })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('lança ConflictException se material já está no evento', async () => {
      mockPrisma.event.findFirst.mockResolvedValue(fakeEvent);
      mockPrisma.material.findFirst.mockResolvedValue(fakeMaterial);
      mockPrisma.eventMaterial.findUnique.mockResolvedValue({ id: 'em1' });
      await expect(service.addMaterial('c1', 'e1', { materialId: 'm1', qtyAllocated: 1 })).rejects.toThrow(
        ConflictException,
      );
    });

    it('lança BadRequestException se evento está cancelado', async () => {
      mockPrisma.event.findFirst.mockResolvedValue({ ...fakeEvent, status: EventStatus.CANCELLED });
      await expect(service.addMaterial('c1', 'e1', { materialId: 'm1', qtyAllocated: 1 })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('adiciona material com sucesso', async () => {
      mockPrisma.event.findFirst.mockResolvedValue(fakeEvent);
      mockPrisma.material.findFirst.mockResolvedValue(fakeMaterial);
      mockPrisma.eventMaterial.findUnique.mockResolvedValue(null);
      mockPrisma.eventMaterial.create.mockResolvedValue({ id: 'em1', qtyAllocated: 2 });
      const result = await service.addMaterial('c1', 'e1', { materialId: 'm1', qtyAllocated: 2 });
      expect(result.qtyAllocated).toBe(2);
    });
  });

  describe('updateAllocation', () => {
    it('lança NotFoundException se alocação não existe', async () => {
      mockPrisma.event.findFirst.mockResolvedValue(fakeEvent);
      mockPrisma.eventMaterial.findUnique.mockResolvedValue(null);
      await expect(service.updateAllocation('c1', 'e1', 'm1', { qtyAllocated: 2 })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('atualiza alocação com sucesso', async () => {
      mockPrisma.event.findFirst.mockResolvedValue(fakeEvent);
      mockPrisma.eventMaterial.findUnique.mockResolvedValue({ id: 'em1', material: fakeMaterial });
      mockPrisma.eventMaterial.update.mockResolvedValue({ id: 'em1', qtyAllocated: 3 });
      const result = await service.updateAllocation('c1', 'e1', 'm1', { qtyAllocated: 3 });
      expect(result.qtyAllocated).toBe(3);
    });
  });

  describe('removeMaterial', () => {
    it('lança NotFoundException se alocação não existe', async () => {
      mockPrisma.event.findFirst.mockResolvedValue(fakeEvent);
      mockPrisma.eventMaterial.findUnique.mockResolvedValue(null);
      await expect(service.removeMaterial('c1', 'e1', 'm1')).rejects.toThrow(NotFoundException);
    });

    it('remove material do evento com sucesso', async () => {
      mockPrisma.event.findFirst.mockResolvedValue(fakeEvent);
      mockPrisma.eventMaterial.findUnique.mockResolvedValue({ id: 'em1' });
      mockPrisma.eventMaterial.delete.mockResolvedValue({ id: 'em1' });
      await service.removeMaterial('c1', 'e1', 'm1');
      expect(mockPrisma.eventMaterial.delete).toHaveBeenCalledOnce();
    });
  });
});
