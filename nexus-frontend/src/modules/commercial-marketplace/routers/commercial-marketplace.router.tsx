import { Navigate, type RouteObject } from "react-router-dom";
import ProtectedRoute from "../../../middlewares/ProtectedRoute";
import BrowseMarketplacePage from "../pages/BrowseMarketplacePage";
import ListingDetailPage from "../pages/ListingDetailPage";
import TradeOfferPage from "../pages/TradeOfferPage";
import PostItemPage from "../pages/PostItemPage";
import MyItemsPage from "../pages/MyItemsPage";
import MyTradesPage from "../pages/MyTradesPage";

const commercialMarketplaceRoutes: RouteObject[] = [
  {
    path: "commercial-marketplace",
    element: <ProtectedRoute role="commercial_citizen" />,
    children: [
      { index: true, element: <Navigate to="browse" replace /> },
      { path: "browse", element: <BrowseMarketplacePage /> },
      { path: "browse/:id", element: <ListingDetailPage /> },
      { path: "browse/:id/offer", element: <TradeOfferPage /> },
      { path: "post", element: <PostItemPage /> },
      { path: "edit/:id", element: <PostItemPage /> },
      { path: "my-items", element: <MyItemsPage /> },
      { path: "my-trades", element: <MyTradesPage /> },
    ],
  },
];

export default commercialMarketplaceRoutes;
