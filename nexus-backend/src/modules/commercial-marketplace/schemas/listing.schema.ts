import { z } from "zod";
import { ListingCategory, ListingCondition } from "../../../generated/prisma/enums";

const categoryValues = Object.values(ListingCategory) as [ListingCategory, ...ListingCategory[]];
const conditionValues = Object.values(ListingCondition) as [ListingCondition, ...ListingCondition[]];

export const createListingSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(1000),
  category: z.enum(categoryValues),
  condition: z.enum(conditionValues),
});

export const updateListingSchema = createListingSchema.partial();

export type CreateListingBody = z.infer<typeof createListingSchema>;
export type UpdateListingBody = z.infer<typeof updateListingSchema>;
