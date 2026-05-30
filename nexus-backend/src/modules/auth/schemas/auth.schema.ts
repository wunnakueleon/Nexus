import { z } from "zod";

export const signUpSchema = z.object({
	name: z.string().min(1),
	username: z.string().min(1),
	password: z.string().min(6),
	inviteCode: z.string().min(1),
});

export const signInSchema = z.object({
	username: z.string().min(1),
	password: z.string().min(1),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
