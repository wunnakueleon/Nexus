import { z } from "zod";

export const approvalIdSchema = z.coerce.number().int().positive();

export const approvalResolveSchema = z.object({
	action: z.enum(["approve", "reject"]),
});

export type ApprovalResolveInput = z.infer<typeof approvalResolveSchema>;
