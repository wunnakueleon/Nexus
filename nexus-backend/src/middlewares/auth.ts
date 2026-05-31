import type { Request, Response, NextFunction } from "express";
import { prisma } from "../db";

// Interim auth: there is no JWT layer yet, so the frontend sends the signed-in
// operator's username in the `x-username` header and we resolve the real user
// from the database. This makes req.user reflect *who is actually logged in*
// (ownership checks, "my listings", trade offers, etc.) instead of a fixed stub.
//
// SECURITY: the header is unauthenticated and trivially spoofable — replace this
// with proper JWT verification before any real deployment.
export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const username = req.header("x-username")?.trim();

    if (username) {
      const user = await prisma.user.findUnique({ where: { username } });
      if (user) {
        (req as Request & { user: unknown }).user = {
          id: user.id,
          role: user.role,
          worldId: user.worldId,
        };
        return next();
      }
    }

    // Fallback dev stub — keeps endpoints working when no/invalid header is sent.
    (req as Request & { user: unknown }).user = { id: 1, role: "commercial_citizen", worldId: 1 };
    next();
  } catch (err) {
    next(err);
  }
};
