import { z } from 'zod';

export const LISTING_CATEGORIES = ['tools', 'food', 'crafts', 'tech', 'clothing', 'medicine', 'art', 'materials'] as const;
export const LISTING_CONDITIONS = ['new_item', 'used', 'handmade', 'rare'] as const;

export const postItemSchema = z.object({
  title:       z.string().min(1, 'Title is required').max(100, 'Title must be 100 characters or less'),
  description: z.string().min(1, 'Description is required').max(1000, 'Description must be 1000 characters or less'),
  category:    z.enum(LISTING_CATEGORIES, { error: 'Please select a category' }),
  condition:   z.enum(LISTING_CONDITIONS, { error: 'Please select a condition' }),
});

export type PostItemFormValues = z.infer<typeof postItemSchema>;
