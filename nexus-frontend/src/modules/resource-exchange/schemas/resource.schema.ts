import { z } from 'zod';

const resourceTypeEnum = z.enum(['fuel', 'water', 'food', 'medicine', 'steel']);
const resourceStatusEnum = z.enum(['surplus', 'stable', 'low', 'critical']);

export const stockRowSchema = z.object({
  resourceType: resourceTypeEnum,
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative'),
  status: resourceStatusEnum,
  burnRate: z.coerce.number().int().min(0, 'Burn rate cannot be negative'),
});

export const updateStocksSchema = z.object({
  stocks: z.array(stockRowSchema).min(1),
});

export type StockRowData = z.infer<typeof stockRowSchema>;
export type UpdateStocksData = z.infer<typeof updateStocksSchema>;
