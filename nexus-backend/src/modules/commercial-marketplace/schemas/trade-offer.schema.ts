import { z } from "zod";

export const createTradeOfferSchema = z.object({
  listingId: z.number().int().positive(),
  offeredListingId: z.number().int().positive(),
});

export type CreateTradeOfferBody = z.infer<typeof createTradeOfferSchema>;
