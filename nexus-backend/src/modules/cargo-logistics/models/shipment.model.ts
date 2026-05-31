import { prisma } from "../../../db";
import { ShipmentFlagType, ShipmentSourceType, ShipmentStatus } from "../../../generated/prisma/enums";
import type {
    CreateShipmentFlagInput,
    CreateShipmentInput,
    RouteOverviewResponse,
    ShipmentDetail,
    ShipmentFlagData,
    ShipmentFilters,
    ShipmentSummary,
} from "../types/cargo-logistics.types";

const ADVANCE_MAP: Partial<Record<ShipmentStatus, ShipmentStatus>> = {
    [ShipmentStatus.preparing]: ShipmentStatus.departed,
    [ShipmentStatus.departed]: ShipmentStatus.in_transit,
    [ShipmentStatus.in_transit]: ShipmentStatus.delivered,
};

const ACTIVE_STATUSES = new Set<ShipmentStatus>([
    ShipmentStatus.preparing,
    ShipmentStatus.departed,
    ShipmentStatus.in_transit,
    ShipmentStatus.delayed,
]);

const DETAIL_INCLUDE = {
    items: true,
    timeline: { orderBy: { timestamp: "asc" as const } },
    flags: { orderBy: { createdAt: "asc" as const } },
} as const;

// Matches seed creation order — mirrors the frontend world-code maps
const WORLD_CODE: Record<number, string> = { 1: "GLV", 2: "NPT", 3: "MNU", 4: "WNM" };

function generateShipmentCode(originWorldId: number): string {
    const code = WORLD_CODE[originWorldId] ?? "SHP";
    const seq = String(Math.floor(Math.random() * 90000) + 10000);
    return `SHP-${code}-${seq}`;
}

export async function listShipments(
    worldId: number,
    filters: ShipmentFilters,
): Promise<ShipmentSummary[]> {
    return prisma.shipment.findMany({
        where: {
            OR: [{ originWorldId: worldId }, { destinationWorldId: worldId }],
            status: filters.status,
            sourceType: filters.sourceType,
            originWorldId: filters.originWorldId,
            destinationWorldId: filters.destinationWorldId,
        },
        include: { items: true },
        orderBy: { createdAt: "desc" },
    }) as Promise<ShipmentSummary[]>;
}

export async function getShipmentById(id: number): Promise<ShipmentDetail | null> {
    return prisma.shipment.findUnique({
        where: { id },
        include: DETAIL_INCLUDE,
    }) as Promise<ShipmentDetail | null>;
}

export async function createShipment(
    data: CreateShipmentInput,
    createdByUserId: number,
): Promise<ShipmentDetail> {
    return prisma.shipment.create({
        data: {
            shipmentCode: generateShipmentCode(data.originWorldId),
            originWorldId: data.originWorldId,
            destinationWorldId: data.destinationWorldId,
            createdByUserId,
            sourceType: data.sourceType,
            tradeRequestId: data.tradeRequestId,
            tradeOfferId: data.tradeOfferId,
            transportReference: data.transportReference,
            scheduledDeparture: data.scheduledDeparture ? new Date(data.scheduledDeparture) : null,
            estimatedArrival: data.estimatedArrival ? new Date(data.estimatedArrival) : null,
            notes: data.notes,
            items: {
                create: data.items.map((item) => ({
                    resourceType: item.resourceType,
                    quantity: item.quantity,
                    conditionNotes: item.conditionNotes,
                })),
            },
            timeline: {
                create: {
                    status: ShipmentStatus.preparing,
                    changedByUserId: createdByUserId,
                },
            },
        },
        include: DETAIL_INCLUDE,
    }) as Promise<ShipmentDetail>;
}

// Auto-generate the two shipments of an accepted resource trade — one for each
// world's outbound goods. Only one shipment can carry the tradeRequestId FK
// (it is unique), so the requested-goods leg holds the link and the
// offered-goods return leg is created unlinked.
export async function createShipmentFromResourceTrade(trade: {
    id: number;
    fromWorldId: number;
    toWorldId: number;
    resourceWanted: string;
    quantityWanted: number;
    resourceOffered: string;
    quantityOffered: number;
    respondedByUserId: number | null;
}): Promise<ShipmentDetail[]> {
    const createdBy = trade.respondedByUserId ?? 1;
    const delivery = await createShipment(
        {
            // Accepting world delivers the requested resource to the requester.
            originWorldId: trade.toWorldId,
            destinationWorldId: trade.fromWorldId,
            sourceType: ShipmentSourceType.resource_trade,
            tradeRequestId: trade.id,
            items: [{ resourceType: trade.resourceWanted, quantity: trade.quantityWanted }],
        },
        createdBy,
    );
    const counter = await createShipment(
        {
            // Requester ships the resource it offered in return.
            originWorldId: trade.fromWorldId,
            destinationWorldId: trade.toWorldId,
            sourceType: ShipmentSourceType.resource_trade,
            items: [{ resourceType: trade.resourceOffered, quantity: trade.quantityOffered }],
        },
        createdBy,
    );
    return [delivery, counter];
}

// Auto-generate the two shipments of an accepted marketplace barter — the
// seller ships the listed item to the buyer, and the buyer ships the offered
// item back. Only the seller→buyer leg carries the unique tradeOfferId FK.
export async function createShipmentFromCommercialTrade(offer: {
    id: number;
    sellerUserId: number;
    buyerUserId: number;
    seller: { world: { id: number } | null };
    buyer: { world: { id: number } | null };
    listing: { title: string; condition: string };
    offeredListing: { title: string; condition: string };
}): Promise<ShipmentDetail[]> {
    const sellerWorldId = offer.seller.world?.id;
    const buyerWorldId = offer.buyer.world?.id;
    // Both parties must belong to a world to route shipments.
    if (!sellerWorldId || !buyerWorldId) return [];

    const delivery = await createShipment(
        {
            // Seller's listed item travels to the buyer.
            originWorldId: sellerWorldId,
            destinationWorldId: buyerWorldId,
            sourceType: ShipmentSourceType.commercial_trade,
            tradeOfferId: offer.id,
            items: [
                {
                    resourceType: offer.listing.title,
                    quantity: 1,
                    conditionNotes: `${offer.listing.condition} · bartered for "${offer.offeredListing.title}"`,
                },
            ],
        },
        offer.sellerUserId,
    );
    const counter = await createShipment(
        {
            // Buyer's offered item travels back to the seller.
            originWorldId: buyerWorldId,
            destinationWorldId: sellerWorldId,
            sourceType: ShipmentSourceType.commercial_trade,
            items: [
                {
                    resourceType: offer.offeredListing.title,
                    quantity: 1,
                    conditionNotes: `${offer.offeredListing.condition} · bartered for "${offer.listing.title}"`,
                },
            ],
        },
        offer.buyerUserId,
    );
    return [delivery, counter];
}

export async function advanceShipmentStatus(
    id: number,
    userId: number,
): Promise<ShipmentDetail | null> {
    return prisma.$transaction(async (tx) => {
        const shipment = await tx.shipment.findUnique({
            where: { id },
            select: { status: true },
        });
        if (!shipment) return null;

        const nextStatus = ADVANCE_MAP[shipment.status];
        if (!nextStatus) return null;

        await tx.shipment.update({ where: { id }, data: { status: nextStatus } });
        await tx.shipmentTimeline.create({
            data: { shipmentId: id, status: nextStatus, changedByUserId: userId },
        });

        return tx.shipment.findUnique({ where: { id }, include: DETAIL_INCLUDE });
    }) as Promise<ShipmentDetail | null>;
}

export async function deliverShipment(
    id: number,
    userId: number,
): Promise<ShipmentDetail | null> {
    return prisma.$transaction(async (tx) => {
        const shipment = await tx.shipment.findUnique({
            where: { id },
            select: { status: true },
        });
        if (!shipment) return null;
        if (
            shipment.status === ShipmentStatus.delivered ||
            shipment.status === ShipmentStatus.cancelled
        ) {
            return null;
        }

        await tx.shipment.update({
            where: { id },
            data: { status: ShipmentStatus.delivered },
        });
        await tx.shipmentTimeline.create({
            data: {
                shipmentId: id,
                status: ShipmentStatus.delivered,
                changedByUserId: userId,
            },
        });

        return tx.shipment.findUnique({ where: { id }, include: DETAIL_INCLUDE });
    }) as Promise<ShipmentDetail | null>;
}

export async function cancelShipment(
    id: number,
    userId: number,
): Promise<ShipmentDetail | null> {
    return prisma.$transaction(async (tx) => {
        const shipment = await tx.shipment.findUnique({
            where: { id },
            select: { status: true },
        });
        if (!shipment) return null;
        if (shipment.status !== ShipmentStatus.preparing) return null;

        await tx.shipment.update({
            where: { id },
            data: { status: ShipmentStatus.cancelled },
        });
        await tx.shipmentTimeline.create({
            data: {
                shipmentId: id,
                status: ShipmentStatus.cancelled,
                changedByUserId: userId,
            },
        });

        return tx.shipment.findUnique({ where: { id }, include: DETAIL_INCLUDE });
    }) as Promise<ShipmentDetail | null>;
}

export async function addShipmentFlag(
    shipmentId: number,
    data: CreateShipmentFlagInput,
    reportedByUserId: number,
): Promise<ShipmentFlagData> {
    return prisma.$transaction(async (tx) => {
        const flag = await tx.shipmentFlag.create({
            data: {
                shipmentId,
                flagType: data.flagType,
                description: data.description,
                reportedByUserId,
            },
        });

        if (data.flagType === ShipmentFlagType.delay) {
            await tx.shipment.update({
                where: { id: shipmentId },
                data: { status: ShipmentStatus.delayed },
            });
            await tx.shipmentTimeline.create({
                data: {
                    shipmentId,
                    status: ShipmentStatus.delayed,
                    changedByUserId: reportedByUserId,
                },
            });
        }

        return flag;
    });
}

export async function getRouteOverview(): Promise<RouteOverviewResponse> {
    const shipments = await prisma.shipment.findMany({
        select: {
            originWorldId: true,
            destinationWorldId: true,
            status: true,
        },
    });

    const corridorMap = new Map<
        string,
        {
            originWorldId: number;
            destinationWorldId: number;
            totalShipments: number;
            activeShipments: number;
            statusBreakdown: Partial<Record<ShipmentStatus, number>>;
        }
    >();

    for (const s of shipments) {
        const key = `${s.originWorldId}:${s.destinationWorldId}`;
        if (!corridorMap.has(key)) {
            corridorMap.set(key, {
                originWorldId: s.originWorldId,
                destinationWorldId: s.destinationWorldId,
                totalShipments: 0,
                activeShipments: 0,
                statusBreakdown: {},
            });
        }
        const entry = corridorMap.get(key)!;
        entry.totalShipments += 1;
        if (ACTIVE_STATUSES.has(s.status)) {
            entry.activeShipments += 1;
        }
        entry.statusBreakdown[s.status] = (entry.statusBreakdown[s.status] ?? 0) + 1;
    }

    return Array.from(corridorMap.values());
}
