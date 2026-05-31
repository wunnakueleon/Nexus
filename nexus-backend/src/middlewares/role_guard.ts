import type { Request, Response, NextFunction } from "express";
import type { AuthedUser } from "./auth";

// Allows the request through only if the authenticated user's role is in the
// allowed list. Must run after `authenticate`, which populates req.user.
export const roleGuard = (roles: string[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const user = (req as Request & { user?: AuthedUser }).user;

    if (!user) {
      const error = new Error("Authentication required") as Error & { status?: number };
      error.status = 401;
      return next(error);
    }

    if (!roles.includes(user.role)) {
      const error = new Error("You do not have permission to access this resource") as Error & { status?: number };
      error.status = 403;
      return next(error);
    }

    next();
  };
