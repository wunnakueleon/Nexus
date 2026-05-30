import { prisma } from "../../../db";
import type { AdminWorldSummary } from "../types/admin.types";

export const getWorldSummaries = async (): Promise<AdminWorldSummary[]> => {
	const worlds = await prisma.world.findMany({
		where: { status: "active" },
		orderBy: { name: "asc" },
	});

	return worlds.map(world => ({
		id: world.id,
		name: world.name,
		colorHex: world.colorHex,
	}));
};
