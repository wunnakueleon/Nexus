import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import OperatorSelect from './shared/components/OperatorSelect';
import Shell from './shared/components/Shell';
import authRoutes from './modules/auth/routers/auth.router';
import adminRoutes from './modules/admin/routers/admin.router';
import resourceExchangeRoutes from './modules/resource-exchange/routers/resource-exchange.router';
import cargoLogisticsRoutes from './modules/cargo-logistics/routers/cargo-logistics.router';
import commercialMarketplaceRoutes from './modules/commercial-marketplace/routers/commercial-marketplace.router';

const mainRouter = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <OperatorSelect /> },
      {
        // Shell is the persistent layout (sidebar + content) for all authenticated routes.
        element: <Shell />,
        children: [
          ...authRoutes,
          ...adminRoutes,
          ...resourceExchangeRoutes,
          ...cargoLogisticsRoutes,
          ...commercialMarketplaceRoutes,
        ],
      },
    ],
  },
]);

export default mainRouter;
