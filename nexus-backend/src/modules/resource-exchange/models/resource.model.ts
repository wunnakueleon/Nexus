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

  updateByWorld: (worldId: number, stocks: UpdateStocksInput['stocks']) => {
    const ops = stocks.map((s) =>
      prisma.resource.update({
        where: { worldId_resourceType: { worldId, resourceType: s.resourceType } },
        data: { stock: s.stock, status: s.status, burnRate: s.burnRate },
      })
    );
    return prisma.$transaction(ops);
  },
};
