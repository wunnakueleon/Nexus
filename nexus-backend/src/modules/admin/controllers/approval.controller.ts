import type { Request, Response, NextFunction } from "express";
import { approvalIdSchema, approvalResolveSchema } from "../schemas/approval.schema";
import { getApprovalHistory, getPendingApprovals, resolveApprovalById } from "../models/approval.model";
import { emitTo } from "../../../realtime/io";
import { Events, roleRoom, userRoom } from "../../../realtime/events";

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

		// Admins: the queue shrank and (on approve) the directory grew.
		emitTo(roleRoom("admin"), Events.ApprovalUpdated);
		if (action === "approve") emitTo(roleRoom("admin"), Events.UserUpdated);
		// The applicant: their account just flipped status — let their pending
		// page advance instantly instead of waiting on the 20s status poll.
		emitTo(userRoom(result.username), Events.AuthStatusChanged, { status: result.status });

		res.json(result);
	} catch (err) {
		next(err);
	}
};

export const getApprovalHistoryList = async (
	_req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const history = await getApprovalHistory();
		res.json(history);
	} catch (err) {
		next(err);
	}
};
