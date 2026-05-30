import { z } from "zod";
import type { CreateShipmentInput } from "../types/cargo-logistics.types";

export const CreateShipmentItemSchema = z.object({
    resourceType: z.string().min(1, "Resource type is required"),
    quantity: z.coerce.number({ error: "Quantity must be a number" }).int().positive("Quantity must be greater than 0"),
    conditionNotes: z.string().optional(),
});

export const CreateShipmentSchema: z.ZodType<CreateShipmentInput> = z.object({
    originWorldId: z.coerce.number({ error: "Origin world is required" }).int().positive(),
    destinationWorldId: z.coerce.number({ error: "Destination world is required" }).int().positive(),
    sourceType: z.enum(["manual", "resource_trade", "commercial_trade"]),
    tradeRequestId: z.number().int().positive().optional(),
    tradeOfferId: z.number().int().positive().optional(),
    transportReference: z.string().optional(),
    scheduledDeparture: z.string().optional(),
    estimatedArrival: z.string().optional(),
    notes: z.string().optional(),
    items: z.array(CreateShipmentItemSchema).min(1, "At least one manifest item is required"),
});

export type CreateShipmentFormValues = z.infer<typeof CreateShipmentSchema>;
