import type { Request, Response, NextFunction } from "express";
import { approvalIdSchema, approvalResolveSchema } from "../schemas/approval.schema";
import { getPendingApprovals, resolveApprovalById } from "../models/approval.model";

export const getApprovalQueue = async (
	_req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const approvals = await getPendingApprovals();
		res.json(approvals);
	} catch (err) {
		next(err);
	}
};

export const resolveApproval = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const id = approvalIdSchema.parse(req.params.id);
		const { action } = approvalResolveSchema.parse(req.body);
		const result = await resolveApprovalById(id, action);

		if (!result) {
			const error = new Error("Approval request not found or already resolved") as Error & { status?: number };
			error.status = 404;
			throw error;
		}

		res.json(result);
	} catch (err) {
		next(err);
	}
};
