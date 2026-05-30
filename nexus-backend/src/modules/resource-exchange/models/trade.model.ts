import { prisma } from '../../../db';
import type { CreateTradeInput, RespondTradeInput } from '../schemas/trade.schema';

const tradeIncludes = {
  fromWorld: { select: { id: true, name: true, colorHex: true } },
  toWorld:   { select: { id: true, name: true, colorHex: true } },
  requestedBy: { select: { id: true, name: true } },
  respondedBy: { select: { id: true, name: true } },
};

export const tradeModel = {
  findByWorld: (worldId: number) =>
    prisma.tradeRequest.findMany({
      where: { OR: [{ fromWorldId: worldId }, { toWorldId: worldId }] },
      include: tradeIncludes,
      orderBy: { createdAt: 'desc' },
    }),

  findById: (id: number) =>
    prisma.tradeRequest.findUnique({
      where: { id },
      include: tradeIncludes,
    }),

  create: (input: CreateTradeInput) =>
    prisma.tradeRequest.create({
      data: {
        fromWorldId:       input.fromWorldId,
        toWorldId:         input.toWorldId,
        requestedByUserId: input.requestedByUserId,
        resourceWanted:    input.resourceWanted,
        quantityWanted:    input.quantityWanted,
        resourceOffered:   input.resourceOffered,
        quantityOffered:   input.quantityOffered,
        urgency:           input.urgency,
        requestComment:    input.requestComment,
      },
      include: tradeIncludes,
    }),

  accept: (id: number, input: RespondTradeInput) =>
    prisma.tradeRequest.update({
      where: { id },
      data: {
        status:            'accepted',
        respondedByUserId: input.respondedByUserId,
        responseComment:   input.responseComment ?? null,
        respondedAt:       new Date(),
      },
      include: tradeIncludes,
    }),

  decline: (id: number, input: RespondTradeInput) =>
    prisma.tradeRequest.update({
      where: { id },
      data: {
        status:            'declined',
        respondedByUserId: input.respondedByUserId,
        responseComment:   input.responseComment ?? null,
        respondedAt:       new Date(),
      },
      include: tradeIncludes,
    }),

  cancel: (id: number) =>
    prisma.tradeRequest.update({
      where: { id },
      data: { status: 'cancelled' },
    }),

  fulfill: (id: number) =>
    prisma.tradeRequest.update({
      where: { id },
      data: { status: 'fulfilled', fulfilledAt: new Date() },
    }),
};
