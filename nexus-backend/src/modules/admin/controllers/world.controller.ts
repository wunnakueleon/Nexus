import type { Request, Response, NextFunction } from "express";
import { getWorldSummaries } from "../models/world.model";

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
