import { z } from "zod";

export const worldIdSchema = z.coerce.number().int().positive();

export const worldUpdateSchema = z.object({
	name: z.string().min(1),
	colorHex: z.string().min(4),
});

export const worldRequestSchema = z.object({
	requestType: z.enum(["addition", "removal"]),
	worldName: z.string().min(1),
	worldId: z.coerce.number().int().positive().nullable().optional(),
	colorHex: z.string().min(4).nullable().optional(),
	reason: z.string().min(1),
});

export const worldRequestResolveSchema = z.object({
	action: z.enum(["approve", "reject"]),
});

export type WorldUpdateInput = z.infer<typeof worldUpdateSchema>;
export type WorldRequestInput = z.infer<typeof worldRequestSchema>;
export type WorldRequestResolveInput = z.infer<typeof worldRequestResolveSchema>;
