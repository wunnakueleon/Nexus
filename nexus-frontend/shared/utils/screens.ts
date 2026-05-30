import React from 'react';
import type { ScreenMap } from '../types/shared.types';

// Admin Portal
import ApprovalQueuePage   from '../../modules/admin/pages/ApprovalQueuePage';
import CodeGenerationPage  from '../../modules/admin/pages/CodeGenerationPage';
import WorldManagementPage from '../../modules/admin/pages/WorldManagementPage';
import UserDirectoryPage   from '../../modules/admin/pages/UserDirectoryPage';
import PlatformOverviewPage from '../../modules/admin/pages/PlatformOverviewPage';

// Cargo Logistics
import ShipmentBoardPage    from '../../modules/cargo-logistics/pages/ShipmentBoardPage';
import CreateShipmentPage   from '../../modules/cargo-logistics/pages/CreateShipmentPage';
import RouteOverviewPage    from '../../modules/cargo-logistics/pages/RouteOverviewPage';

// Resource Exchange
import ResourceOverviewPage from '../../modules/resource-exchange/pages/ResourceOverviewPage';
import TradeDashboardPage   from '../../modules/resource-exchange/pages/TradeDashboardPage';
import RequestTradePage     from '../../modules/resource-exchange/pages/RequestTradePage';

// Marketplace
import BrowseMarketplacePage from '../../modules/commercial-marketplace/pages/BrowseMarketplacePage';
import PostItemPage          from '../../modules/commercial-marketplace/pages/PostItemPage';
import MyItemsPage           from '../../modules/commercial-marketplace/pages/MyItemsPage';
import MyTradesPage          from '../../modules/commercial-marketplace/pages/MyTradesPage';

const Placeholder: React.FC = () =>
  React.createElement('div', {
    className: 'flex items-center justify-center h-64 text-fg-secondary text-sm font-mono nx-uppercase',
  }, 'Module loading…');

// Sidebar screen maps. `path` is relative to the module base route.
// hidden: true = routed but not shown in the sidebar.
export const ADMIN_SCREENS: ScreenMap = {
  approvals: { label: 'Approval Queue',    icon: 'list',     path: 'approval-queue',   comp: ApprovalQueuePage },
  codes:     { label: 'Code Generation',   icon: 'code',     path: 'code-generation',  comp: CodeGenerationPage },
  worlds:    { label: 'World Management',  icon: 'globe',    path: 'world-management', comp: WorldManagementPage },
  directory: { label: 'User Directory',    icon: 'users',    path: 'user-directory',   comp: UserDirectoryPage },
  overview:  { label: 'Platform Overview', icon: 'overview', path: 'overview',          comp: PlatformOverviewPage },
};
export const RESOURCE_SCREENS: ScreenMap = {
  overview:  { label: 'Resource Overview', icon: 'overview', path: 'overview',  comp: ResourceOverviewPage },
  dashboard: { label: 'Trade Dashboard',   icon: 'list',     path: 'trade',     comp: TradeDashboardPage, end: true },
  request:   { label: 'Request Trade',     icon: 'resource', path: 'trade/new', comp: RequestTradePage },
};
export const CARGO_SCREENS: ScreenMap = {
  board:  { label: 'Shipment Board',  icon: 'list',  path: 'shipments',     comp: ShipmentBoardPage,  end: true },
  create: { label: 'Create Shipment', icon: 'plus',  path: 'shipments/new', comp: CreateShipmentPage },
  routes: { label: 'Route Overview',  icon: 'route', path: 'routes',        comp: RouteOverviewPage },
  detail: { label: 'Shipment Detail', icon: 'cargo', path: 'shipments',     comp: Placeholder,        hidden: true },
};
export const MARKETPLACE_SCREENS: ScreenMap = {
  browse: { label: 'Browse Marketplace', icon: 'market', path: 'browse',    comp: BrowseMarketplacePage },
  post:   { label: 'Post Item',          icon: 'plus',   path: 'post',      comp: PostItemPage },
  items:  { label: 'My Items',           icon: 'box',    path: 'my-items',  comp: MyItemsPage },
  trades: { label: 'My Trades',          icon: 'list',   path: 'my-trades', comp: MyTradesPage },
};
