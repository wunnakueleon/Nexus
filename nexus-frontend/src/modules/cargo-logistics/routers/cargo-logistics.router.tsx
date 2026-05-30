import { Navigate, type RouteObject } from "react-router-dom";
import ProtectedRoute from "../../../middlewares/ProtectedRoute";
import ShipmentBoardPage from "../pages/ShipmentBoardPage";
import CreateShipmentPage from "../pages/CreateShipmentPage";
import ShipmentDetailPage from "../pages/ShipmentDetailPage";
import RouteOverviewPage from "../pages/RouteOverviewPage";

const cargoLogisticsRoutes: RouteObject[] = [
  {
    path: "cargo-logistics",
    element: <ProtectedRoute role="transit_officer" />,
    children: [
      { index: true, element: <Navigate to="shipments" replace /> },
      { path: "shipments", element: <ShipmentBoardPage /> },
      { path: "shipments/new", element: <CreateShipmentPage /> },
      { path: "shipments/:id", element: <ShipmentDetailPage /> },
      { path: "routes", element: <RouteOverviewPage /> },
    ],
  },
];

export default cargoLogisticsRoutes;
