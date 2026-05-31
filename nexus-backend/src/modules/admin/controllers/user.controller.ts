import type { Request, Response, NextFunction } from "express";
import { userIdSchema, userStatusSchema } from "../schemas/user.schema";
import { listDirectoryUsers, updateUserStatus } from "../models/user.model";
import { emitTo } from "../../../realtime/io";
import { Events, roleRoom, userRoom } from "../../../realtime/events";

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

		// Admins: the directory row changed. The affected operator: their access
		// was revoked/reinstated — push it so their session reacts immediately.
		emitTo(roleRoom("admin"), Events.UserUpdated);
		emitTo(userRoom(updated.username), Events.AuthStatusChanged, { status: updated.status });

		res.json(updated);
	} catch (err) {
		next(err);
	}
};
