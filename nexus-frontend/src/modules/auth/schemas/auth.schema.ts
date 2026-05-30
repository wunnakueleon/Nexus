import { z } from 'zod';

// Mirrors the backend rules (password min 6) with user-facing messages.
export const signUpSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters.')
    .max(20, 'Username must be 20 characters or less.')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores (no spaces).'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  inviteCode: z.string().min(1, 'Invite code is required.'),
});

export const signInSchema = z.object({
  username: z.string().min(1, 'Username is required.'),
  password: z.string().min(1, 'Password is required.'),
});

export type SignUpFormValues = z.infer<typeof signUpSchema>;
export type SignInFormValues = z.infer<typeof signInSchema>;
