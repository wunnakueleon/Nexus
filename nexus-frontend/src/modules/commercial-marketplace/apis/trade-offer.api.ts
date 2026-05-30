import api from '../../../api';
import type {
  TradeOfferResponse,
  CreateTradeOfferInput,
} from '../types/commercial-marketplace.types';

const BASE = '/api/commercial-marketplace/offers';

export const getIncomingOffers = (): Promise<TradeOfferResponse[]> =>
  api.get(`${BASE}/incoming`).then(r => r.data);

export const getOutgoingOffers = (): Promise<TradeOfferResponse[]> =>
  api.get(`${BASE}/outgoing`).then(r => r.data);

export const getCompletedOffers = (): Promise<TradeOfferResponse[]> =>
  api.get(`${BASE}/completed`).then(r => r.data);

export const createOffer = (data: CreateTradeOfferInput): Promise<TradeOfferResponse> =>
  api.post(BASE, data).then(r => r.data);

export const acceptOffer = (id: number): Promise<TradeOfferResponse> =>
  api.patch(`${BASE}/${id}/accept`).then(r => r.data);

export const declineOffer = (id: number): Promise<TradeOfferResponse> =>
  api.patch(`${BASE}/${id}/decline`).then(r => r.data);

export const withdrawOffer = (id: number): Promise<TradeOfferResponse> =>
  api.delete(`${BASE}/${id}`).then(r => r.data);
