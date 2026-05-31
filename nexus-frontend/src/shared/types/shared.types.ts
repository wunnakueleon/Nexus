import type React from 'react';

// ---- Worlds ----------------------------------------------------------------
export interface WorldInfo {
  id: string;
  name: string;
  color: string;
  dim: string;
}

export interface World extends WorldInfo {
  identity: string;
  added: string;
}

// ---- Resources -------------------------------------------------------------
export interface ResourceStock {
  resource: string;
  stock: number;
  status: 'Surplus' | 'Stable' | 'Low' | 'Critical';
  burn: number;
}

// ---- Trades ----------------------------------------------------------------
export interface Trade {
  id: string;
  from: string;
  to: string;
  wantRes: string;
  wantQty: number;
  offerRes: string;
  offerQty: number;
  urgency: 'Normal' | 'Urgent' | 'Critical';
  comment: string;
  status: 'Pending' | 'Accepted' | 'Declined' | 'Fulfilled';
  responderComment: string;
  date: string;
}

export type NewTrade = Omit<Trade, 'id' | 'status' | 'responderComment' | 'date'>;

// ---- Shipments -------------------------------------------------------------
export interface TimelineStep {
  step: string;
  ts: string | null;
  done: boolean;
  current: boolean;
}

export interface ManifestItem {
  res: string;
  qty: number;
  notes: string;
}

export interface ShipmentFlag {
  desc: string;
  ts: string;
  by: string;
}

export interface Shipment {
  id: string;
  origin: string;
  dest: string;
  status: string;
  departure: string;
  eta: string;
  flagged: boolean;
  manifest: ManifestItem[];
  timeline: TimelineStep[];
  flags: ShipmentFlag[];
  ref: string | null;
}

// ---- Marketplace -----------------------------------------------------------
export interface Listing {
  id: string;
  title: string;
  category: string;
  condition: string;
  world: string;
  seller: string;
  desc: string;
  icon: string;
  date: string;
  mine: boolean;
  status: 'Available' | 'In Pending Trade' | 'Traded';
  photo: string | null;
}

export type NewListing = Pick<Listing, 'title' | 'category' | 'condition' | 'desc' | 'icon'> & {
  photo?: string | null;
};

export interface TradeItemRef {
  title: string;
  icon: string;
  world?: string;
}

export interface MarketplaceOffer {
  id: string;
  dir: 'incoming' | 'outgoing' | 'completed';
  theirItem?: TradeItemRef;
  yourItem?: TradeItemRef;
  status: string;
  date: string;
  gave?: TradeItemRef;
  got?: TradeItemRef;
  partner?: string;
  world?: string;
}

// ---- Admin -----------------------------------------------------------------
export interface AdminCode {
  code: string;
  world: string;
  role: string;
  status: 'Available' | 'Used' | 'Expired';
  usedBy: string;
  created: string;
}

export interface Approval {
  id: string;
  name: string;
  world: string;
  role: string;
  code: string;
  date: string;
}

export interface UserRecord {
  id: string;
  name: string;
  world: string;
  role: string;
  status: 'Active' | 'Revoked';
  approved: string;
}

export interface WorldRequest {
  id: string;
  type: 'Addition' | 'Removal';
  world: string;
  reason: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  color: string;
}

export interface WorldHistoryEntry {
  id: string;
  type: 'Addition' | 'Removal';
  world: string;
  reason: string;
  dates: string;
  status: 'Approved' | 'Rejected';
}

// ---- Operator auth ---------------------------------------------------------
export interface OperatorState {
  role: string;
  worldId: string | null;
  name: string;
  username?: string;
  status?: "active" | "pending" | "rejected" | "revoked";
}

// ---- Sidebar ---------------------------------------------------------------
export interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  end?: boolean;
}

// ---- Screen routing --------------------------------------------------------
export interface ScreenConfig {
  label: string;
  icon: string;
  path: string;
  comp?: React.ComponentType;
  hidden?: boolean;
  end?: boolean; // passed to NavLink — use true when a sibling path is a sub-path of this one
}

export type ScreenMap = Record<string, ScreenConfig>;

// ---- Full app context ------------------------------------------------------
export interface AppContextValue {
  // Auth
  operator: OperatorState | null;
  setOperator: (op: OperatorState | null | ((prev: OperatorState | null) => OperatorState | null)) => void;
  logout: () => void;

  // Worlds
  worlds: World[];
  worldById: (id: string) => WorldInfo;

  // Resource constants (static, exposed for convenience)
  RESOURCES: string[];
  RESOURCE_UNITS: Record<string, string>;
  unitOf: (res: string) => string;
  STEPS: string[];

  // Resource stocks
  stocks: Record<string, ResourceStock[]>;
  saveStocks: (worldId: string, rows: ResourceStock[]) => void;

  // Trades
  trades: Trade[];
  sendTrade: (t: NewTrade) => void;
  respondTrade: (id: string, action: 'accept' | 'decline', comment?: string) => void;
  cancelTrade: (id: string) => void;
  fulfillTrade: (id: string) => void;

  // Shipments
  shipments: Shipment[];
  createShipment: (dest: string, origin: string, manifest: ManifestItem[], ref: string | null, departure: string) => void;
  advanceShipment: (id: string) => void;
  confirmDelivery: (id: string) => void;
  addFlag: (id: string, desc: string, by: string) => void;

  // Marketplace
  listings: Listing[];
  myItems: Listing[];
  offers: MarketplaceOffer[];
  postItem: (item: NewListing) => void;
  editItem: (id: string, patch: Partial<Listing>) => void;
  deleteItem: (id: string) => void;
  submitOffer: (listing: Listing, myItem: Listing) => void;
  respondOffer: (id: string, action: 'accept' | 'decline') => void;
  withdrawOffer: (id: string) => void;

  // Admin
  codes: AdminCode[];
  approvals: Approval[];
  users: UserRecord[];
  worldReqs: WorldRequest[];
  worldHist: WorldHistoryEntry[];
  resolveApproval: (id: string, action: 'approve' | 'reject') => void;
  generateCodes: (world: string, role: string, qty: number) => void;
  expireCode: (code: string) => void;
  toggleUser: (id: string) => void;
  resolveWorldReq: (id: string, action: 'approve' | 'reject') => void;
  requestWorld: (name: string, color: string, reason: string) => void;

  // Toast
  toast: string | null;
  flash: (msg: string) => void;
}
