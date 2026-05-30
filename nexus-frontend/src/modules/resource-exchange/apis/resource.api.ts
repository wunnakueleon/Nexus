import api from '../../../api';
import type { ApiResponse, ResourceRow, StockUpdate } from '../types/resource-exchange.types';

const BASE = '/resource-exchange/resources';

export const resourceApi = {
  getAll: () =>
    api.get<ApiResponse<ResourceRow[]>>(BASE),

  getByWorld: (worldId: number) =>
    api.get<ApiResponse<ResourceRow[]>>(`${BASE}/${worldId}`),

  updateStocks: (worldId: number, stocks: StockUpdate[]) =>
    api.put<ApiResponse<ResourceRow[]>>(`${BASE}/${worldId}`, { stocks }),
};
