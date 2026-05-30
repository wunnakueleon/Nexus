import type { Request, Response, NextFunction } from "express";
import { accessCodeIdSchema, generateCodeSchema } from "../schemas/code.schema";
import { expireAccessCode, generateAccessCodes, listAccessCodes } from "../models/code.model";

export const getAccessCodes = async (
	_req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const codes = await listAccessCodes();
		res.json(codes);
	} catch (err) {
		next(err);
	}
};

export const generateCodes = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const { worldId, role, qty } = generateCodeSchema.parse(req.body);
		const enforcedQty = role === "commercial_citizen" ? qty : 1;
		const created = await generateAccessCodes(worldId, role, enforcedQty);
		res.status(201).json(created);
	} catch (err) {
		next(err);
	}
};

export const expireCode = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const id = accessCodeIdSchema.parse(req.params.id);
		const updated = await expireAccessCode(id);
		if (!updated) {
			const error = new Error("Access code not found") as Error & { status?: number };
			error.status = 404;
			throw error;
		}
		res.json(updated);
	} catch (err) {
		next(err);
	}
};
