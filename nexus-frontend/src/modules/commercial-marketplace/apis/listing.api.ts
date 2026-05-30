import api from '../../../api';
import type {
  ListingResponse,
  CreateListingInput,
  UpdateListingInput,
  ListingCategory,
} from '../types/commercial-marketplace.types';

const BASE = '/api/commercial-marketplace/listings';

export interface GetListingsParams {
  category?: ListingCategory;
  worldId?: number;
  keyword?: string;
}

export const getListings = (params?: GetListingsParams): Promise<ListingResponse[]> =>
  api.get(BASE, { params }).then(r => r.data);

export const getListingById = (id: number): Promise<ListingResponse> =>
  api.get(`${BASE}/${id}`).then(r => r.data);

export const getMyListings = (): Promise<ListingResponse[]> =>
  api.get(`${BASE}/my`).then(r => r.data);

export const createListing = (data: CreateListingInput): Promise<ListingResponse> =>
  api.post(BASE, data).then(r => r.data);

export const updateListing = (id: number, data: UpdateListingInput): Promise<ListingResponse> =>
  api.put(`${BASE}/${id}`, data).then(r => r.data);

export const deleteListing = (id: number): Promise<void> =>
  api.delete(`${BASE}/${id}`).then(r => r.data);
