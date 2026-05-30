import { Navigate, type RouteObject } from "react-router-dom";
import ProtectedRoute from "../../../middlewares/ProtectedRoute";
import ApprovalQueuePage from "../pages/ApprovalQueuePage";
import CodeGenerationPage from "../pages/CodeGenerationPage";
import WorldManagementPage from "../pages/WorldManagementPage";
import UserDirectoryPage from "../pages/UserDirectoryPage";
import PlatformOverviewPage from "../pages/PlatformOverviewPage";

const adminRoutes: RouteObject[] = [
  {
    path: "admin",
    element: <ProtectedRoute role="admin" />,
    children: [
      { index: true, element: <Navigate to="approval-queue" replace /> },
      { path: "approval-queue", element: <ApprovalQueuePage /> },
      { path: "code-generation", element: <CodeGenerationPage /> },
      { path: "world-management", element: <WorldManagementPage /> },
      { path: "user-directory", element: <UserDirectoryPage /> },
      { path: "overview", element: <PlatformOverviewPage /> },
    ],
  },
];

export default adminRoutes;
