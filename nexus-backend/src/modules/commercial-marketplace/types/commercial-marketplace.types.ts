import type {
  ListingCategory,
  ListingCondition,
  ListingStatus,
  TradeOfferStatus,
} from "../../../generated/prisma/enums";

// ---------------------------------------------------------------------------
// Shared building blocks
// ---------------------------------------------------------------------------

export interface ImageRef {
  id: number;
  imageUrl: string;
  displayOrder: number;
}

export interface UserWorldRef {
  id: number;
  name: string;
  worldId: number;
  worldName: string;
  worldColorHex: string;
}

export interface ListingSummary {
  id: number;
  title: string;
  category: ListingCategory;
  primaryImageUrl: string | null;
}

// ---------------------------------------------------------------------------
// Response shapes
// ---------------------------------------------------------------------------

export interface ListingResponse {
  id: number;
  title: string;
  description: string;
  category: ListingCategory;
  condition: ListingCondition;
  status: ListingStatus;
  createdAt: Date;
  updatedAt: Date;
  images: ImageRef[];
  owner: UserWorldRef;
}

export interface TradeOfferResponse {
  id: number;
  status: TradeOfferStatus;
  createdAt: Date;
  resolvedAt: Date | null;
  listing: ListingSummary;         // the seller's listing being requested
  offeredListing: ListingSummary;  // the buyer's listing offered in exchange
  buyer: UserWorldRef;
  seller: UserWorldRef;
}

// ---------------------------------------------------------------------------
// Request bodies
// ---------------------------------------------------------------------------

export interface CreateListingInput {
  title: string;
  description: string;
  category: ListingCategory;
  condition: ListingCondition;
  imageUrls?: string[];            // ordered list; index 0 becomes displayOrder 1
}

export interface UpdateListingInput {
  title?: string;
  description?: string;
  category?: ListingCategory;
  condition?: ListingCondition;
  status?: Extract<ListingStatus, "available" | "deleted">;
  imageUrls?: string[];            // replaces all existing images when provided
}

export interface CreateTradeOfferInput {
  listingId: number;               // the listing the buyer wants
  offeredListingId: number;        // the buyer's listing offered in exchange
}
