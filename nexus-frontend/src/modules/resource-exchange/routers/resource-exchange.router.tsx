import { Navigate, type RouteObject } from "react-router-dom";
import ProtectedRoute from "../../../middlewares/ProtectedRoute";
import ResourceOverviewPage from "../pages/ResourceOverviewPage";
import TradeDashboardPage from "../pages/TradeDashboardPage";
import RequestTradePage from "../pages/RequestTradePage";

const resourceExchangeRoutes: RouteObject[] = [
  {
    path: "resource-exchange",
    element: <ProtectedRoute role="resource_manager" />,
    children: [
      { index: true, element: <Navigate to="overview" replace /> },
      { path: "overview", element: <ResourceOverviewPage /> },
      { path: "trade", element: <TradeDashboardPage /> },
      { path: "trade/new", element: <RequestTradePage /> },
    ],
  },
];

export default resourceExchangeRoutes;
