import type { Request, Response, NextFunction } from "express";
import { userIdSchema, userStatusSchema } from "../schemas/user.schema";
import { listDirectoryUsers, updateUserStatus } from "../models/user.model";

export const getUsers = async (
	_req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const users = await listDirectoryUsers();
		res.json(users);
	} catch (err) {
		next(err);
	}
};

export const setUserStatus = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const id = userIdSchema.parse(req.params.id);
		const { action } = userStatusSchema.parse(req.body);
		const updated = await updateUserStatus(id, action);
		if (!updated) {
			const error = new Error("User not found") as Error & { status?: number };
			error.status = 404;
			throw error;
		}
		res.json(updated);
	} catch (err) {
		next(err);
	}
};
