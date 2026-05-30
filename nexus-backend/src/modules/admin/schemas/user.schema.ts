import { z } from "zod";

export const userIdSchema = z.coerce.number().int().positive();

export const userStatusSchema = z.object({
  action: z.enum(["revoke", "reinstate"]),
});

export type UserStatusInput = z.infer<typeof userStatusSchema>;
