import type { Request, Response, NextFunction } from "express";

// TODO: implement JWT verification — decode token, attach req.user, call next() or 401
export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  // Dev stub: attach the first user until real JWT auth is implemented
  (req as Request & { user: unknown }).user = { id: 1, role: "commercial_citizen", worldId: 1 };
  next();
};
