import type { Request, Response, NextFunction } from "express";

// TODO: implement role check — read req.user.role, return 403 if not in allowed list
export const roleGuard = (_roles: string[]) =>
  (_req: Request, _res: Response, next: NextFunction) => {
    next();
  };
