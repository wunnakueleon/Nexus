import { z } from "zod";

export const accessCodeIdSchema = z.coerce.number().int().positive();

export const generateCodeSchema = z.object({
	worldId: z.coerce.number().int().positive(),
	role: z.enum(["resource_manager", "transit_officer", "commercial_citizen"]),
	qty: z.coerce.number().int().positive().max(50),
});

export type GenerateCodeInput = z.infer<typeof generateCodeSchema>;
