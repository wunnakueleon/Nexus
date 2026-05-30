import { prisma } from "../../../db";
import type { ApprovalAction, ApprovalQueueItem, ApprovalResolveResult } from "../types/admin.types";

export const getPendingApprovals = async (): Promise<ApprovalQueueItem[]> => {
	const users = await prisma.user.findMany({
		where: { status: "pending" },
		include: { world: true, code: true },
		orderBy: { createdAt: "desc" },
	});

	return users.map(user => ({
		id: user.id,
		name: user.name,
		role: user.role,
		worldId: user.worldId,
		worldName: user.world.name,
		code: user.code.codeString,
		submittedAt: user.createdAt,
	}));
};

export const resolveApprovalById = async (
	id: number,
	action: ApprovalAction,
): Promise<ApprovalResolveResult | null> => {
	const user = await prisma.user.findUnique({ where: { id } });
	if (!user || user.status !== "pending") return null;

	const nextStatus = action === "approve" ? "active" : "revoked";
	await prisma.user.update({
		where: { id },
		data: {
			status: nextStatus,
			approvedAt: action === "approve" ? new Date() : null,
		},
	});

	return { id, status: nextStatus };
};
