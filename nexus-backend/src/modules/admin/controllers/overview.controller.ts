import type { Request, Response, NextFunction } from "express";
import { getPlatformOverview } from "../models/overview.model";

export const getOverview = async (
	_req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const overview = await getPlatformOverview();
		res.json(overview);
	} catch (err) {
		next(err);
	}
};