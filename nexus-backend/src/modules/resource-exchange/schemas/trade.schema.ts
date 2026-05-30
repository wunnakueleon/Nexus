import { z } from 'zod';

const resourceTypeEnum = z.enum(['fuel', 'water', 'food', 'medicine', 'steel']);

export const createTradeSchema = z.object({
  fromWorldId: z.number().int().positive(),
  toWorldId: z.number().int().positive(),
  requestedByUserId: z.number().int().positive().optional(),
  resourceWanted: resourceTypeEnum,
  quantityWanted: z.number().int().positive(),
  resourceOffered: resourceTypeEnum,
  quantityOffered: z.number().int().positive(),
  urgency: z.enum(['normal', 'urgent', 'critical']).default('normal'),
  requestComment: z.string().optional(),
});

export const respondTradeSchema = z.object({
  respondedByUserId: z.number().int().positive().optional(),
  responseComment: z.string().optional(),
});

export type CreateTradeInput = z.infer<typeof createTradeSchema>;
export type RespondTradeInput = z.infer<typeof respondTradeSchema>;
