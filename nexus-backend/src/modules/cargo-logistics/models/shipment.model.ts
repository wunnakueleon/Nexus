import { prisma } from "../../../db";
import { ShipmentFlagType, ShipmentStatus } from "../../../generated/prisma/enums";
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

function generateShipmentCode(): string {
    const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
    return `SHP-${Date.now()}-${suffix}`;
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
        orderBy: { createdAt: "desc" },
    });
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
            shipmentCode: generateShipmentCode(),
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
