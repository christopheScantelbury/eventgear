import { z } from 'zod';

export const CreateMaterialSchema = z.object({
  name: z.string().min(1).max(200),
  category: z.string().min(1).max(100),
  totalQty: z.number().int().positive(),
  description: z.string().max(1000).optional(),
  serialNumber: z.string().max(100).optional(),
  brand: z.string().max(100).optional(),
  model: z.string().max(100).optional(),
  replaceCost: z.number().positive().optional(),
});

export const UpdateMaterialSchema = CreateMaterialSchema.partial();

export type CreateMaterialDto = z.infer<typeof CreateMaterialSchema>;
export type UpdateMaterialDto = z.infer<typeof UpdateMaterialSchema>;
