import { z } from 'zod';

const resourceTypeEnum = z.enum(['fuel', 'water', 'food', 'medicine', 'steel']);
const resourceStatusEnum = z.enum(['surplus', 'stable', 'low', 'critical']);

export const updateStocksSchema = z.object({
  stocks: z
    .array(
      z.object({
        resourceType: resourceTypeEnum,
        stock: z.number().int().min(0),
        status: resourceStatusEnum,
        burnRate: z.number().int().min(0),
      })
    )
    .min(1),
});

export type UpdateStocksInput = z.infer<typeof updateStocksSchema>;
