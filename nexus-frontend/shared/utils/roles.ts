import type { ScreenMap } from '../types/shared.types';
import { ADMIN_SCREENS, RESOURCE_SCREENS, CARGO_SCREENS, MARKETPLACE_SCREENS } from './screens';

export interface RoleConfig {
  id: string;
  feature: string;
  icon: string;
  desc: string;
  basePath: string;
  map: () => ScreenMap;
  neutral?: boolean;
}

export const ROLES: RoleConfig[] = [
  { id: 'Admin',              feature: 'Admin Portal',           icon: 'admin',    basePath: '/admin',                  desc: 'Neutral governance and access control',                map: () => ADMIN_SCREENS,        neutral: true },
  { id: 'Resource Manager',   feature: 'Resource Exchange',      icon: 'resource', basePath: '/resource-exchange',      desc: 'Government-level resource sharing between worlds',     map: () => RESOURCE_SCREENS  },
  { id: 'Transit Officer',    feature: 'Cargo Logistics',        icon: 'cargo',    basePath: '/cargo-logistics',        desc: 'Track every shipment moving between worlds',           map: () => CARGO_SCREENS     },
  { id: 'Commercial Citizen', feature: 'Commercial Marketplace', icon: 'market',   basePath: '/commercial-marketplace', desc: 'Barter goods across the galaxy',                       map: () => MARKETPLACE_SCREENS },
];
