import { prisma } from "../../../db";
import type { TradeOfferStatus } from "../../../generated/prisma/enums";

// ---------------------------------------------------------------------------
// Reusable include — listing summary with primary image only
// ---------------------------------------------------------------------------

const safeUser = {
  select: {
    id: true, name: true,
    world: { select: { id: true, name: true, colorHex: true } },
  },
};

const listingSummary = {
  images: { where: { displayOrder: 1 }, take: 1 },
};

const offerDetail = {
  listing:        { include: { ...listingSummary, user: safeUser } },
  offeredListing: { include: { ...listingSummary, user: safeUser } },
  buyer:   safeUser,
  seller:  safeUser,
};

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export const findIncoming = (sellerUserId: number) =>
  prisma.tradeOffer.findMany({
    where: { sellerUserId, status: "pending" as TradeOfferStatus },
    include: offerDetail,
    orderBy: { createdAt: "desc" },
  });

export const findOutgoing = (buyerUserId: number) =>
  prisma.tradeOffer.findMany({
    where: { buyerUserId },
    include: offerDetail,
    orderBy: { createdAt: "desc" },
  });

export const findCompleted = (userId: number) =>
  prisma.tradeOffer.findMany({
    where: {
      status: "accepted" as TradeOfferStatus,
      OR: [{ buyerUserId: userId }, { sellerUserId: userId }],
    },
    include: offerDetail,
    orderBy: { resolvedAt: "desc" },
  });

export const create = (data: {
  listingId: number;
  offeredListingId: number;
  buyerUserId: number;
  sellerUserId: number;
}) =>
  prisma.tradeOffer.create({
    data,
    include: offerDetail,
  });

export const updateStatus = (id: number, status: TradeOfferStatus) =>
  prisma.tradeOffer.update({
    where: { id },
    data: {
      status,
      resolvedAt: ["accepted", "declined"].includes(status) ? new Date() : undefined,
    },
    include: offerDetail,
  });
