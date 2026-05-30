import { prisma } from '../../../db';
import type { UpdateStocksInput } from '../schemas/resource.schema';

const worldSelect = { select: { id: true, name: true, colorHex: true } };

export const resourceModel = {
  findAll: () =>
    prisma.resource.findMany({
      include: { world: worldSelect },
      orderBy: [{ worldId: 'asc' }, { resourceType: 'asc' }],
    }),

  findByWorld: (worldId: number) =>
    prisma.resource.findMany({
      where: { worldId },
      include: { world: worldSelect },
      orderBy: { resourceType: 'asc' },
    }),

  updateByWorld: async (worldId: number, stocks: UpdateStocksInput['stocks']) => {
    const results = [];
    for (const s of stocks) {
      const updated = await prisma.resource.update({
        where: {
          worldId_resourceType: {
            worldId,
            resourceType: s.resourceType as 'fuel' | 'water' | 'food' | 'medicine' | 'steel',
          },
        },
        data: { stock: s.stock, status: s.status as 'surplus' | 'stable' | 'low' | 'critical', burnRate: s.burnRate },
      });
      results.push(updated);
    }
    return results;
  },
};
