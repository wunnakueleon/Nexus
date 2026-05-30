import { z } from "zod";
import {
    ShipmentSourceType,
    ShipmentStatus,
    ShipmentFlagType,
} from "../../../generated/prisma/enums";

export const CreateShipmentItemSchema = z.object({
    resourceType: z.string().min(1),
    quantity: z.number().int().positive(),
    conditionNotes: z.string().optional(),
});

export const CreateShipmentSchema = z.object({
    originWorldId: z.number().int().positive(),
    destinationWorldId: z.number().int().positive(),
    sourceType: z.enum(ShipmentSourceType),
    tradeRequestId: z.number().int().positive().optional(),
    tradeOfferId: z.number().int().positive().optional(),
    transportReference: z.string().optional(),
    scheduledDeparture: z.string().optional(),
    estimatedArrival: z.string().optional(),
    notes: z.string().optional(),
    items: z.array(CreateShipmentItemSchema).min(1),
});

export const AdvanceShipmentStatusSchema = z.object({
    notes: z.string().optional(),
});

export const CreateShipmentFlagSchema = z.object({
    flagType: z.enum(ShipmentFlagType),
    description: z.string().min(1),
});

export const ShipmentFiltersSchema = z.object({
    status: z.enum(ShipmentStatus).optional(),
    sourceType: z.enum(ShipmentSourceType).optional(),
    originWorldId: z.coerce.number().int().positive().optional(),
    destinationWorldId: z.coerce.number().int().positive().optional(),
});
