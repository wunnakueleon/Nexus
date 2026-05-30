import type { Request, Response, NextFunction } from "express";

// TODO: implement JWT verification — decode token, attach req.user, call next() or 401
export const authenticate = (_req: Request, _res: Response, next: NextFunction) => {
  next();
};
