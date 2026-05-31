/**
 * Frontend mirror of the backend real-time contract
 * (nexus-backend/src/realtime/events.ts). Keep the two files in sync.
 *
 * Events are treated as "something changed, refetch" signals: a listener calls
 * the page's existing fetch function rather than merging a pushed payload. This
 * keeps the REST response as the single source of truth and sidesteps merge /
 * ordering bugs.
 */

export const SOCKET_EVENTS = {
  // Admin dashboards
  ApprovalCreated: 'approval:created',
  ApprovalUpdated: 'approval:updated',
  UserUpdated: 'user:updated',
  CodeUpdated: 'code:updated',
  WorldUpdated: 'world:updated',

  // Resource exchange
  ResourceUpdated: 'resource:updated',
  TradeUpdated: 'trade:updated',

  // Cargo logistics
  ShipmentUpdated: 'shipment:updated',

  // Commercial marketplace
  ListingUpdated: 'listing:updated',
  OfferUpdated: 'offer:updated',

  // Per-user account status
  AuthStatusChanged: 'auth:status',
} as const;

export type SocketEvent = (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];

/** Operator role labels (as stored on operator.role) → backend role enums. */
export const ROLE_LABEL_TO_ENUM: Record<string, string> = {
  Admin: 'admin',
  'Resource Manager': 'resource_manager',
  'Transit Officer': 'transit_officer',
  'Commercial Citizen': 'commercial_citizen',
};
