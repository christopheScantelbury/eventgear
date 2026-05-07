import { z } from 'zod';

export const ConfirmChecklistItemSchema = z.object({
  status: z.enum(['CONFIRMED', 'MISSING', 'DAMAGED']),
  scannedQrCode: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export type ConfirmChecklistItemDto = z.infer<typeof ConfirmChecklistItemSchema>;
