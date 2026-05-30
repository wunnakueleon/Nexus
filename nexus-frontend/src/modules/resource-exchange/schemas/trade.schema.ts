import { z } from 'zod';

const resourceTypeEnum = z.enum(['fuel', 'water', 'food', 'medicine', 'steel']);

export const createTradeSchema = z.object({
  fromWorldId: z.number().int().positive(),
  toWorldId: z.number().int().positive(),
  requestedByUserId: z.number().int().positive(),
  resourceWanted: resourceTypeEnum,
  quantityWanted: z.coerce.number().int().positive('Quantity must be at least 1'),
  resourceOffered: resourceTypeEnum,
  quantityOffered: z.coerce.number().int().positive('Quantity must be at least 1'),
  urgency: z.enum(['normal', 'urgent', 'critical']).default('normal'),
  requestComment: z.string().optional(),
});

export const respondTradeSchema = z.object({
  respondedByUserId: z.number().int().positive(),
  responseComment: z.string().optional(),
});

export type CreateTradeData = z.infer<typeof createTradeSchema>;
export type RespondTradeData = z.infer<typeof respondTradeSchema>;
