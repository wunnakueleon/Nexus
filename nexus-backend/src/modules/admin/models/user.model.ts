import { prisma } from "../../../db";
import type { UserDirectoryRow } from "../types/admin.types";

export const listDirectoryUsers = async (): Promise<UserDirectoryRow[]> => {
	const users = await prisma.user.findMany({
		where: {
			role: { in: ["resource_manager", "transit_officer", "commercial_citizen"] },
			status: { in: ["active", "revoked"] },
		},
		include: { world: true },
		orderBy: { approvedAt: "desc" },
	});

	return users.map(user => ({
		id: user.id,
		name: user.name,
		username: user.username,
		role: user.role as UserDirectoryRow["role"],
		worldId: user.worldId,
		worldName: user.world.name,
		status: user.status === "active"
			? "active"
			: user.approvedAt
				? "revoked"
				: "rejected",
		approvedAt: user.approvedAt,
	}));
};

export const updateUserStatus = async (
	id: number,
	action: "revoke" | "reinstate",
): Promise<UserDirectoryRow | null> => {
	const user = await prisma.user.findUnique({ where: { id }, include: { world: true } });
	if (!user) return null;
	if (action === "reinstate" && user.world.status !== "active") {
		const error = new Error("World is removed. Cannot reinstate user.") as Error & { status?: number };
		error.status = 409;
		throw error;
	}
	if (action === "reinstate" && !user.approvedAt) {
		const error = new Error("Rejected users cannot be reinstated.") as Error & { status?: number };
		error.status = 409;
		throw error;
	}

	const nextStatus = action === "revoke" ? "revoked" : "active";
	const updated = await prisma.user.update({
		where: { id },
		data: { status: nextStatus },
		include: { world: true },
	});

	return {
		id: updated.id,
		name: updated.name,
		username: updated.username,
		role: updated.role as UserDirectoryRow["role"],
		worldId: updated.worldId,
		worldName: updated.world.name,
		status: updated.status === "active"
			? "active"
			: updated.approvedAt
				? "revoked"
				: "rejected",
		approvedAt: updated.approvedAt,
	};
};
