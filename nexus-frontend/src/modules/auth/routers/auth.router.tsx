import { type RouteObject } from "react-router-dom";
import SignInPage from "../pages/SignInPage";
import SignUpPage from "../pages/SignUpPage";
import PendingApprovalPage from "../pages/PendingApprovalPage";
import RejectedPage from "../pages/RejectedPage";

const authRoutes: RouteObject[] = [
  { path: "signin", element: <SignInPage /> },
  { path: "signup", element: <SignUpPage /> },
  { path: "pending-approval", element: <PendingApprovalPage /> },
  { path: "account-rejected", element: <RejectedPage /> },
];

export default authRoutes;
