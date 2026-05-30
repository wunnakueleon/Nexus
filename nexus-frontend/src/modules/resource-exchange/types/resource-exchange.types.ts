export type ResourceType = 'fuel' | 'water' | 'food' | 'medicine' | 'steel';
export type ResourceStatus = 'surplus' | 'stable' | 'low' | 'critical';
export type TradeUrgency = 'normal' | 'urgent' | 'critical';
export type TradeStatus = 'pending' | 'accepted' | 'declined' | 'cancelled' | 'fulfilled';

export interface WorldSummary {
  id: number;
  name: string;
  colorHex: string;
}

export interface UserSummary {
  id: number;
  name: string;
}

export interface ResourceRow {
  id: number;
  worldId: number;
  resourceType: ResourceType;
  stock: number;
  status: ResourceStatus;
  burnRate: number;
  updatedAt: string;
  world: WorldSummary;
}

export interface StockUpdate {
  resourceType: ResourceType;
  stock: number;
  status: ResourceStatus;
  burnRate: number;
}

export interface TradeRequestRow {
  id: number;
  fromWorldId: number;
  toWorldId: number;
  requestedByUserId: number;
  resourceWanted: ResourceType;
  quantityWanted: number;
  resourceOffered: ResourceType;
  quantityOffered: number;
  urgency: TradeUrgency;
  requestComment: string | null;
  status: TradeStatus;
  responseComment: string | null;
  respondedByUserId: number | null;
  createdAt: string;
  respondedAt: string | null;
  fulfilledAt: string | null;
  fromWorld: WorldSummary;
  toWorld: WorldSummary;
  requestedBy: UserSummary;
  respondedBy: UserSummary | null;
}

export interface CreateTradePayload {
  fromWorldId: number;
  toWorldId: number;
  requestedByUserId?: number;
  resourceWanted: ResourceType;
  quantityWanted: number;
  resourceOffered: ResourceType;
  quantityOffered: number;
  urgency: TradeUrgency;
  requestComment?: string;
}

export interface RespondTradePayload {
  respondedByUserId: number;
  responseComment?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}
