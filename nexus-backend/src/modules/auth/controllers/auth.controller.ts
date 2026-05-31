import type { Request, Response, NextFunction } from "express";
import { signInSchema, signUpSchema } from "../schemas/auth.schema";
import { getAuthStatusByUsername, signInWithCredentials, signUpWithCode } from "../models/auth.model";
import { emitTo } from "../../../realtime/io";
import { Events, roleRoom } from "../../../realtime/events";

export const signUp = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const payload = signUpSchema.parse(req.body);
		const result = await signUpWithCode(payload);
		// A new signup lands in the pending queue — tell every admin to refetch.
		emitTo(roleRoom("admin"), Events.ApprovalCreated);
		res.status(201).json(result);
	} catch (err) {
		next(err);
	}
};

export const signIn = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const payload = signInSchema.parse(req.body);
		const result = await signInWithCredentials(payload);
		res.json(result);
	} catch (err) {
		next(err);
	}
};

export const getAuthStatus = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const username = String(req.query.username ?? "").trim();
		if (!username) {
			const error = new Error("Username is required") as Error & { status?: number };
			error.status = 400;
			throw error;
		}
		const result = await getAuthStatusByUsername(username);
		if (!result) {
			const error = new Error("User not found") as Error & { status?: number };
			error.status = 404;
			throw error;
		}
		res.json(result);
	} catch (err) {
		next(err);
	}
};
