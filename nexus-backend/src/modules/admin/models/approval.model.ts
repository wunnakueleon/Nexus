import { prisma } from "../../../db";
import type { ApprovalAction, ApprovalHistoryItem, ApprovalQueueItem, ApprovalResolveResult } from "../types/admin.types";

export const getPendingApprovals = async (): Promise<ApprovalQueueItem[]> => {
	const users = await prisma.user.findMany({
		where: { status: "pending" },
		include: { world: true, code: true },
		orderBy: { createdAt: "desc" },
	});

	return users.map(user => ({
		id: user.id,
		name: user.name,
		username: user.username,
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

export const getApprovalHistory = async (): Promise<ApprovalHistoryItem[]> => {
	const users = await prisma.user.findMany({
		where: {
			role: { in: ["resource_manager", "transit_officer", "commercial_citizen"] },
			status: { in: ["active", "revoked"] },
		},
		include: { world: true },
		orderBy: { createdAt: "desc" },
	});

	return users.map(user => ({
		id: user.id,
		name: user.name,
		username: user.username,
		role: user.role as ApprovalHistoryItem["role"],
		worldId: user.worldId,
		worldName: user.world.name,
		status: user.approvedAt ? "approved" : "rejected",
		resolvedAt: user.approvedAt ?? user.createdAt,
	}));
};
