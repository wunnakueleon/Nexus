import type { RouteObject } from "react-router-dom";
import HomePage from "../pages/HomePage";
import SignInPage from "../pages/SignInPage";
import SignUpPage from "../pages/SignUpPage";

const authRoutes: RouteObject[] = [
  { index: true, element: <HomePage /> },
  { path: "signin", element: <SignInPage /> },
  { path: "signup", element: <SignUpPage /> },
];

export default authRoutes;
