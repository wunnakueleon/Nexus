import type { Request, Response, NextFunction } from "express";
import { signInSchema, signUpSchema } from "../schemas/auth.schema";
import { signInWithCredentials, signUpWithCode } from "../models/auth.model";

export const signUp = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const payload = signUpSchema.parse(req.body);
		const result = await signUpWithCode(payload);
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
