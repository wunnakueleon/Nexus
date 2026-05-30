import type { Request, Response, NextFunction } from "express";
import {
	worldIdSchema,
	worldRequestResolveSchema,
	worldRequestSchema,
	worldUpdateSchema,
} from "../schemas/world.schema";
import {
	createWorldRequest,
	getWorldSummaries,
	listWorldRequests,
	resolveWorldRequest,
	updateWorld,
} from "../models/world.model";

export const listWorlds = async (
	_req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const worlds = await getWorldSummaries();
		res.json(worlds);
	} catch (err) {
		next(err);
	}
};

export const updateWorldDetails = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const id = worldIdSchema.parse(req.params.id);
		const payload = worldUpdateSchema.parse(req.body);
		const updated = await updateWorld(id, payload.name, payload.colorHex);
		if (!updated) {
			const error = new Error("World not found") as Error & { status?: number };
			error.status = 404;
			throw error;
		}
		res.json(updated);
	} catch (err) {
		next(err);
	}
};

export const getPendingWorldRequests = async (
	_req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const rows = await listWorldRequests("pending");
		res.json(rows);
	} catch (err) {
		next(err);
	}
};

export const getWorldRequestHistory = async (
	_req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const rows = await listWorldRequests("resolved");
		res.json(rows);
	} catch (err) {
		next(err);
	}
};

export const submitWorldRequest = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const payload = worldRequestSchema.parse(req.body);
		const row = await createWorldRequest({
			requestType: payload.requestType,
			worldName: payload.worldName,
			worldId: payload.worldId ?? null,
			colorHex: payload.colorHex ?? null,
			reason: payload.reason,
		});
		res.status(201).json(row);
	} catch (err) {
		next(err);
	}
};

export const resolveWorldRequestById = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const id = worldIdSchema.parse(req.params.id);
		const { action } = worldRequestResolveSchema.parse(req.body);
		const updated = await resolveWorldRequest(id, action);
		if (!updated) {
			const error = new Error("World request not found or already resolved") as Error & { status?: number };
			error.status = 404;
			throw error;
		}
		res.json(updated);
	} catch (err) {
		next(err);
	}
};
