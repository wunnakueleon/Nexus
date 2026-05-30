// Enums mirror the Prisma enum values from the backend
export type ListingCategory = 'tools' | 'food' | 'crafts' | 'tech' | 'clothing' | 'medicine' | 'art' | 'materials';
export type ListingCondition = 'new_item' | 'used' | 'handmade' | 'rare';
export type ListingStatus    = 'available' | 'in_pending_trade' | 'traded' | 'deleted';
export type TradeOfferStatus = 'pending' | 'accepted' | 'declined' | 'withdrawn';

// ---------------------------------------------------------------------------
// Shared building blocks
// ---------------------------------------------------------------------------

export interface ImageRef {
  id: number;
  imageUrl: string;
  displayOrder: number;
}

// Flattened user + world as returned by the API.
// worldColorHex corresponds to WorldInfo.color in shared.types.ts
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
  createdAt: string;
  updatedAt: string;
  images: ImageRef[];
  owner: UserWorldRef;
}

export interface TradeOfferResponse {
  id: number;
  status: TradeOfferStatus;
  createdAt: string;
  resolvedAt: string | null;
  listing: ListingSummary;        // seller's listing being requested
  offeredListing: ListingSummary; // buyer's listing offered in exchange
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
  imageUrls?: string[];
}

export interface UpdateListingInput {
  title?: string;
  description?: string;
  category?: ListingCategory;
  condition?: ListingCondition;
  imageUrls?: string[];
}

export interface CreateTradeOfferInput {
  listingId: number;
  offeredListingId: number;
}
