import { prisma } from "../../../db";
import type { ListingCategory, ListingCondition, ListingStatus } from "../../../generated/prisma/enums";

// ---------------------------------------------------------------------------
// Reusable include — full listing detail
// ---------------------------------------------------------------------------

const safeUser = {
  select: {
    id: true, name: true,
    world: { select: { id: true, name: true, colorHex: true } },
  },
};

const listingDetail = {
  images: { orderBy: { displayOrder: "asc" as const } },
  user: safeUser,
};

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export interface FindAllFilters {
  category?: ListingCategory;
  worldId?: number;
  keyword?: string;
}

export const findAll = (filters: FindAllFilters = {}) => {
  const { category, worldId, keyword } = filters;

  return prisma.listing.findMany({
    where: {
      // Browse board shows items still on offer; traded/deleted drop off
      status: { in: ["available", "in_pending_trade"] as ListingStatus[] },
      ...(category && { category }),
      ...(worldId && { user: { worldId } }),
      ...(keyword && {
        OR: [
          { title: { contains: keyword } },
          { description: { contains: keyword } },
        ],
      }),
    },
    include: listingDetail,
    orderBy: { createdAt: "desc" },
  });
};

export const findById = (id: number) =>
  prisma.listing.findUnique({
    where: { id },
    include: listingDetail,
  });

export const findByUserId = (userId: number) =>
  prisma.listing.findMany({
    where: { userId, status: { not: "deleted" as ListingStatus } },
    include: listingDetail,
    orderBy: { createdAt: "desc" },
  });

export const create = (
  userId: number,
  data: {
    title: string;
    description: string;
    category: ListingCategory;
    condition: ListingCondition;
    imageUrls?: string[];
  },
) =>
  prisma.listing.create({
    data: {
      userId,
      title: data.title,
      description: data.description,
      category: data.category,
      condition: data.condition,
      images: data.imageUrls?.length
        ? {
            create: data.imageUrls.map((imageUrl, i) => ({
              imageUrl,
              displayOrder: i + 1,
            })),
          }
        : undefined,
    },
    include: listingDetail,
  });

export const update = (
  id: number,
  data: {
    title?: string;
    description?: string;
    category?: ListingCategory;
    condition?: ListingCondition;
    status?: ListingStatus;
    imageUrls?: string[];
  },
) => {
  const { imageUrls, ...fields } = data;

  return prisma.$transaction(async (tx) => {
    if (imageUrls !== undefined) {
      await tx.listingImage.deleteMany({ where: { listingId: id } });
      await tx.listingImage.createMany({
        data: imageUrls.map((imageUrl, i) => ({
          listingId: id,
          imageUrl,
          displayOrder: i + 1,
        })),
      });
    }

    return tx.listing.update({
      where: { id },
      data: fields,
      include: listingDetail,
    });
  });
};

export const softDelete = (id: number) =>
  prisma.listing.update({
    where: { id },
    data: { status: "deleted" as ListingStatus },
  });
