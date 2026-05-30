import type {
  ShipmentSourceType,
  ShipmentStatus,
  ShipmentFlagType,
} from "../../../generated/prisma/enums";

// --- Base Data Shapes (mirror Prisma scalar fields) ---

export interface ShipmentData {
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
  scheduledDeparture: Date | null;
  estimatedArrival: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
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
  timestamp: Date;
}

export interface ShipmentFlagData {
  id: number;
  shipmentId: number;
  flagType: ShipmentFlagType;
  description: string;
  reportedByUserId: number;
  createdAt: Date;
}

// --- Response Shapes ---

export type ShipmentSummary = ShipmentData;

export interface ShipmentDetail extends ShipmentData {
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

// --- Input Shapes ---

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

export interface AdvanceShipmentStatusInput {
  notes?: string;
}

export interface CreateShipmentFlagInput {
  flagType: ShipmentFlagType;
  description: string;
}

// --- Query Filter Shape ---

export interface ShipmentFilters {
  status?: ShipmentStatus;
  sourceType?: ShipmentSourceType;
  originWorldId?: number;
  destinationWorldId?: number;
}
