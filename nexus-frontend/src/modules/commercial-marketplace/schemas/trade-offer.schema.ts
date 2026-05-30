import { z } from 'zod';

// listingId comes from the URL param — only the offered item is selected in the form
export const createOfferSchema = z.object({
  offeredListingId: z.number({ error: 'Please select an item to offer' }).int().positive('Please select an item to offer'),
});

export type CreateOfferFormValues = z.infer<typeof createOfferSchema>;
