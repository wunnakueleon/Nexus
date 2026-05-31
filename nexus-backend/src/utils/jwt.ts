import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";

// The secret must be provided in production. The fallback only exists so local
// dev works out of the box — it is intentionally obvious so it is never shipped.
const JWT_SECRET = process.env.JWT_SECRET ?? "dev-insecure-secret-change-me";
const JWT_EXPIRES_IN: SignOptions["expiresIn"] =
	(process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"]) ?? "7d";

// What we encode into the token — enough to authenticate and authorize a request
// without another DB round-trip on every call.
export interface JwtPayload {
	id: number;
	role: string;
	worldId: number | null;
	username: string;
}

export const signToken = (payload: JwtPayload): string =>
	jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

// Throws if the token is missing, malformed, expired, or signed with another key.
export const verifyToken = (token: string): JwtPayload =>
	jwt.verify(token, JWT_SECRET) as JwtPayload;
