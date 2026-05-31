import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";

// The authenticated identity attached to every guarded request.
export interface AuthedUser {
  id: number;
  role: string;
  worldId: number | null;
  username: string;
}

// Verifies the `Authorization: Bearer <jwt>` header. On success, attaches the
// decoded identity to req.user; otherwise rejects with 401. There is no longer
// any spoofable header or dev fallback — a valid token is required.
export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  const header = req.header("authorization");

  if (!header?.startsWith("Bearer ")) {
    const error = new Error("Authentication required") as Error & { status?: number };
    error.status = 401;
    return next(error);
  }

  try {
    const payload = verifyToken(header.slice("Bearer ".length).trim());
    (req as Request & { user: AuthedUser }).user = {
      id: payload.id,
      role: payload.role,
      worldId: payload.worldId,
      username: payload.username,
    };
    next();
  } catch {
    const error = new Error("Invalid or expired token") as Error & { status?: number };
    error.status = 401;
    next(error);
  }
};
