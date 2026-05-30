// --- Enum Types (match backend Prisma enum values exactly) ---

export type ShipmentSourceType = "manual" | "resource_trade" | "commercial_trade";

export type ShipmentStatus =
    | "preparing"
    | "departed"
    | "in_transit"
    | "delivered"
    | "delayed"
    | "cancelled";

export type ShipmentFlagType = "delay" | "damage" | "missing_items" | "other";

// --- Response Shapes (dates are ISO strings after JSON serialization) ---

export interface ShipmentSummary {
    id: number;
    shipmentCode: string;
    originWorldId: number;
    destinationWorldId: number;
    createdByUserId: number | null;
    sourceType: ShipmentSourceType;
    tradeRequestId: number | null;
    tradeOfferId: number | null;
    transportReference: string | null;
    status: ShipmentStatus;
    scheduledDeparture: string | null;
    estimatedArrival: string | null;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
    items: ShipmentItemData[];
}

export interface ShipmentItemData {
    id: number;
    shipmentId: number;
    resourceType: string;
    quantity: number;
    conditionNotes: string | null;
}

export interface ShipmentTimelineEntry {
    id: number;
    shipmentId: number;
    status: ShipmentStatus;
    changedByUserId: number;
    timestamp: string;
}

export interface ShipmentFlagData {
    id: number;
    shipmentId: number;
    flagType: ShipmentFlagType;
    description: string;
    reportedByUserId: number;
    createdAt: string;
}

export interface ShipmentDetail extends ShipmentSummary {
    items: ShipmentItemData[];
    timeline: ShipmentTimelineEntry[];
    flags: ShipmentFlagData[];
}

export interface RouteOverviewItem {
    originWorldId: number;
    destinationWorldId: number;
    totalShipments: number;
    activeShipments: number;
    statusBreakdown: Partial<Record<ShipmentStatus, number>>;
}

export type RouteOverviewResponse = RouteOverviewItem[];

// --- Request / Input Shapes ---

export interface CreateShipmentItemInput {
    resourceType: string;
    quantity: number;
    conditionNotes?: string;
}

export interface CreateShipmentInput {
    originWorldId: number;
    destinationWorldId: number;
    sourceType: ShipmentSourceType;
    tradeRequestId?: number;
    tradeOfferId?: number;
    transportReference?: string;
    scheduledDeparture?: string;
    estimatedArrival?: string;
    notes?: string;
    items: CreateShipmentItemInput[];
}

export interface CreateShipmentFlagInput {
    flagType: ShipmentFlagType;
    description: string;
}

export interface ShipmentFilters {
    status?: ShipmentStatus;
    sourceType?: ShipmentSourceType;
    originWorldId?: number;
    destinationWorldId?: number;
}
