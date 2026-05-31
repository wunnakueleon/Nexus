/**
 * Real-time contract — room names and event names shared by every emitter.
 *
 * Naming conventions
 * ------------------
 * Rooms:   "<scope>:<id>"      e.g. "role:admin", "user:dsarraf"
 * Events:  "<domain>:<action>" e.g. "approval:created", "trade:updated"
 *
 * Payloads are intentionally tiny (usually just an id or nothing). Clients use
 * an event as a *signal* to refetch the relevant list through the existing REST
 * endpoint, rather than trying to merge a server-pushed entity into local state.
 * This keeps a single source of truth (the REST response), avoids duplicate /
 * out-of-order update bugs, and keeps socket traffic minimal.
 */

export type AuthRole =
  | "admin"
  | "resource_manager"
  | "transit_officer"
  | "commercial_citizen";

/** Build the role topic-room name a socket joins based on its role. */
export const roleRoom = (role: AuthRole | string): string => `role:${role}`;

/** Build the per-user room used for account-status notifications. */
export const userRoom = (username: string): string => `user:${username}`;

export const Events = {
  // ---- Admin domain (room: role:admin) ----
  ApprovalCreated: "approval:created", // new signup is now pending
  ApprovalUpdated: "approval:updated", // a pending request was approved/rejected
  UserUpdated: "user:updated", // directory user revoked/reinstated/created
  CodeUpdated: "code:updated", // access code generated or expired
  WorldUpdated: "world:updated", // world edited or a world request created/resolved

  // ---- Resource exchange (room: role:resource_manager) ----
  ResourceUpdated: "resource:updated", // a world's stock levels changed
  TradeUpdated: "trade:updated", // trade request created/accepted/declined/cancelled/fulfilled

  // ---- Cargo logistics (room: role:transit_officer) ----
  ShipmentUpdated: "shipment:updated", // shipment created/advanced/delivered/cancelled/flagged

  // ---- Commercial marketplace (room: role:commercial_citizen) ----
  ListingUpdated: "listing:updated", // listing created/edited/removed/status-changed
  OfferUpdated: "offer:updated", // trade offer created/accepted/declined/withdrawn

  // ---- Per-user account status (room: user:<username>) ----
  AuthStatusChanged: "auth:status", // this account was approved/rejected/revoked/reinstated
} as const;

export type EventName = (typeof Events)[keyof typeof Events];
