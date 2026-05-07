import { z } from 'zod';

export const CreateEventSchema = z.object({
  name: z.string().min(1).max(200),
  startDate: z.string().datetime(),
  returnDate: z.string().datetime(),
  location: z.string().max(200).optional(),
  client: z.string().max(200).optional(),
  notes: z.string().max(2000).optional(),
});

export const UpdateEventSchema = CreateEventSchema.partial();

export const AllocateMaterialSchema = z.object({
  materialId: z.string().cuid(),
  qtyAllocated: z.number().int().positive(),
});

export type CreateEventDto = z.infer<typeof CreateEventSchema>;
export type UpdateEventDto = z.infer<typeof UpdateEventSchema>;
export type AllocateMaterialDto = z.infer<typeof AllocateMaterialSchema>;
