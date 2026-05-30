import api from '../../../api';
import type {
  ApiResponse,
  TradeRequestRow,
  CreateTradePayload,
  RespondTradePayload,
} from '../types/resource-exchange.types';

const BASE = '/resource-exchange/trades';

export const tradeApi = {
  getByWorld: (worldId: number) =>
    api.get<ApiResponse<TradeRequestRow[]>>(BASE, { params: { worldId } }),

  getById: (id: number) =>
    api.get<ApiResponse<TradeRequestRow>>(`${BASE}/${id}`),

  create: (payload: CreateTradePayload) =>
    api.post<ApiResponse<TradeRequestRow>>(BASE, payload),

  accept: (id: number, payload: RespondTradePayload) =>
    api.patch<ApiResponse<TradeRequestRow>>(`${BASE}/${id}/accept`, payload),

  decline: (id: number, payload: RespondTradePayload) =>
    api.patch<ApiResponse<TradeRequestRow>>(`${BASE}/${id}/decline`, payload),

  cancel: (id: number) =>
    api.patch<ApiResponse<TradeRequestRow>>(`${BASE}/${id}/cancel`),

  fulfill: (id: number) =>
    api.patch<ApiResponse<TradeRequestRow>>(`${BASE}/${id}/fulfill`),
};
