export type ListingCategory = 'tools' | 'food' | 'crafts' | 'tech' | 'clothing' | 'medicine' | 'art' | 'materials';
export type ListingCondition = 'new_item' | 'used' | 'handmade' | 'rare';
export type ListingStatus    = 'available' | 'in_pending_trade' | 'traded' | 'deleted';
export type TradeOfferStatus = 'pending' | 'accepted' | 'declined' | 'withdrawn';

// ---------------------------------------------------------------------------
// Shared building blocks (match actual API response shapes)
// ---------------------------------------------------------------------------

export interface ImageRef {
  id: number;
  imageUrl: string;
  displayOrder: number;
}

export interface WorldRef {
  id: number;
  name: string;
  colorHex: string;
}

export interface UserRef {
  id: number;
  name: string;
  world: WorldRef;
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
  user: UserRef;
}

export interface TradeOfferResponse {
  id: number;
  listingId: number;
  offeredListingId: number;
  status: TradeOfferStatus;
  createdAt: string;
  resolvedAt: string | null;
  listing: ListingResponse;
  offeredListing: ListingResponse;
  buyer: UserRef;
  seller: UserRef;
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
