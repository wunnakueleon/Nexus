import type { WorldInfo } from '../types/shared.types';

export const STATUS_MAP: Record<string, { t: string; b: string }> = {
  Surplus:            { t: '#2E8B8B', b: '#0A1F20' },
  Stable:             { t: '#5F8A3E', b: '#142010' },
  Low:                { t: '#E8960C', b: '#2B1F08' },
  Critical:           { t: '#D93025', b: '#2B0A08' },
  Pending:            { t: '#B08D3E', b: '#1F1A0A' },
  Accepted:           { t: '#5F8A3E', b: '#142010' },
  Declined:           { t: '#D93025', b: '#2B0A08' },
  Fulfilled:          { t: '#2E8B8B', b: '#0A1F20' },
  Available:          { t: '#5F8A3E', b: '#142010' },
  Used:               { t: '#8A95A5', b: '#1C2129' },
  Expired:            { t: '#505C6E', b: '#151920' },
  Active:             { t: '#5F8A3E', b: '#142010' },
  Revoked:            { t: '#D93025', b: '#2B0A08' },
  Approved:           { t: '#5F8A3E', b: '#142010' },
  Rejected:           { t: '#D93025', b: '#2B0A08' },
  Preparing:          { t: '#B08D3E', b: '#1F1A0A' },
  Departed:           { t: '#D4890A', b: '#2B1F08' },
  'In Transit':       { t: '#D4890A', b: '#2B1F08' },
  Delivered:          { t: '#5F8A3E', b: '#142010' },
  Delayed:            { t: '#D93025', b: '#2B0A08' },
  Normal:             { t: '#8A95A5', b: '#1C2129' },
  Urgent:             { t: '#E8960C', b: '#2B1F08' },
  Traded:             { t: '#505C6E', b: '#151920' },
  'In Pending Trade': { t: '#B08D3E', b: '#1F1A0A' },
  INBOUND:            { t: '#2E8B8B', b: '#0A1F20' },
  OUTBOUND:           { t: '#D4890A', b: '#2B1F08' },
};

export const CAT_ICON: Record<string, string> = {
  Tools: 'tools', Food: 'food', Tech: 'tech', Materials: 'materials',
  Medicine: 'medicine', Art: 'art', Crafts: 'crafts', Clothing: 'clothing',
};

// Fallback world colors used when worldById is called outside a Provider
// (or for an unknown ID). Keys match the canonical world IDs from the store.
export const WORLD_DEFAULTS: Record<string, WorldInfo> = {
  GLV: { id: 'GLV', name: 'GloriaVenus', color: '#C47A1A', dim: '#2B1F08' },
  NPT: { id: 'NPT', name: 'NanPtune',    color: '#3A8C8C', dim: '#0A1F20' },
  MNU: { id: 'MNU', name: 'MinUranus',   color: '#4A6FA5', dim: '#0E1825' },
  WNM: { id: 'WNM', name: 'WunnaMars',   color: '#A04030', dim: '#1F0E0A' },
};

export const RESOURCES = ['Fuel', 'Water', 'Food', 'Medicine', 'Steel'];

export const RESOURCE_UNITS: Record<string, string> = {
  Fuel: 'MT', Water: 'KL', Food: 'MT', Medicine: 'MT', Steel: 'MT',
};

export const STEPS = ['Created', 'Preparing', 'Departed', 'In Transit', 'Delivered'];
