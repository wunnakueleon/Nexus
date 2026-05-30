import { prisma } from "../../../db";
import type { Prisma } from "../../../generated/prisma/client";
import type {
  AdminWorldSummary,
  WorldRequestAction,
  WorldRequestRow,
  WorldRequestType,
} from "../types/admin.types";

export const getWorldSummaries = async (): Promise<AdminWorldSummary[]> => {
	const worlds = await prisma.world.findMany({
		orderBy: { name: "asc" },
	});

	return worlds.map(world => ({
		id: world.id,
		name: world.name,
		colorHex: world.colorHex,
		status: world.status,
		createdAt: world.createdAt,
	}));
};

export const updateWorld = async (id: number, name: string, colorHex: string): Promise<AdminWorldSummary | null> => {
	const existing = await prisma.world.findUnique({ where: { id } });
	if (!existing) return null;
	const updated = await prisma.world.update({
		where: { id },
		data: { name, colorHex },
	});
	return {
		id: updated.id,
		name: updated.name,
		colorHex: updated.colorHex,
		status: updated.status,
		createdAt: updated.createdAt,
	};
};

export const createWorldRequest = async (input: {
	requestType: WorldRequestType;
	worldName: string;
	worldId?: number | null;
	colorHex?: string | null;
	reason: string;
}): Promise<WorldRequestRow> => {
	const row = await prisma.worldRequest.create({
		data: {
			requestType: input.requestType,
			worldName: input.worldName,
			worldId: input.worldId ?? null,
			colorHex: input.colorHex ?? null,
			reason: input.reason,
		},
	});

	return {
		id: row.id,
		requestType: row.requestType,
		worldName: row.worldName,
		worldId: row.worldId,
		colorHex: row.colorHex,
		reason: row.reason,
		status: row.status,
		requestedAt: row.requestedAt,
		resolvedAt: row.resolvedAt,
	};
};

export const listWorldRequests = async (status: "pending" | "resolved"): Promise<WorldRequestRow[]> => {
	const where: Prisma.WorldRequestWhereInput = status === "pending"
		? { status: "pending" }
		: { status: { in: ["approved", "rejected"] } };
	const rows = await prisma.worldRequest.findMany({
		where,
		orderBy: { requestedAt: "desc" },
	});

	return rows.map(row => ({
		id: row.id,
		requestType: row.requestType,
		worldName: row.worldName,
		worldId: row.worldId,
		colorHex: row.colorHex,
		reason: row.reason,
		status: row.status,
		requestedAt: row.requestedAt,
		resolvedAt: row.resolvedAt,
	}));
};

const applyWorldRemovalSideEffects = async (worldId: number) => {
	await prisma.accessCode.updateMany({
		where: { worldId },
		data: { status: "expired" },
	});

	await prisma.user.updateMany({
		where: { worldId, role: { not: "admin" } },
		data: { status: "revoked" },
	});
};

export const resolveWorldRequest = async (
	requestId: number,
	action: WorldRequestAction,
): Promise<WorldRequestRow | null> => {
	const request = await prisma.worldRequest.findUnique({ where: { id: requestId } });
	if (!request || request.status !== "pending") return null;

	const resolvedAt = new Date();
	let nextStatus: "approved" | "rejected" = action === "approve" ? "approved" : "rejected";
	let worldId = request.worldId;

	if (action === "approve") {
		if (request.requestType === "addition") {
			const existing = await prisma.world.findUnique({ where: { name: request.worldName } });
			if (existing) {
				const updated = await prisma.world.update({
					where: { id: existing.id },
					data: {
						status: "active",
						colorHex: request.colorHex ?? existing.colorHex,
					},
				});
				worldId = updated.id;
			} else {
				const created = await prisma.world.create({
					data: {
						name: request.worldName,
						colorHex: request.colorHex ?? "#5F8A3E",
						status: "active",
					},
				});
				worldId = created.id;
			}
		}

		if (request.requestType === "removal" && request.worldId) {
			await prisma.world.update({
				where: { id: request.worldId },
				data: { status: "removed" },
			});
			await applyWorldRemovalSideEffects(request.worldId);
		}
	}

	const updatedRequest = await prisma.worldRequest.update({
		where: { id: requestId },
		data: {
			status: nextStatus,
			resolvedAt,
			worldId: worldId ?? request.worldId,
		},
	});

	return {
		id: updatedRequest.id,
		requestType: updatedRequest.requestType,
		worldName: updatedRequest.worldName,
		worldId: updatedRequest.worldId,
		colorHex: updatedRequest.colorHex,
		reason: updatedRequest.reason,
		status: updatedRequest.status,
		requestedAt: updatedRequest.requestedAt,
		resolvedAt: updatedRequest.resolvedAt,
	};
};
