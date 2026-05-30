import { prisma } from "../../../db";
import type { AccessCodeRole, AccessCodeRow } from "../types/admin.types";

const WORLD_TAGS: Record<string, string> = {
	GloriaVenus: "GLV",
	NanPtune: "NPT",
	MinUranus: "MNU",
	WunnaMars: "WNM",
};

const ROLE_TAGS: Record<AccessCodeRole, string> = {
	resource_manager: "RSM",
	transit_officer: "TRO",
	commercial_citizen: "CCZ",
};

const randomDigits = () => Math.floor(1000 + Math.random() * 9000).toString();

const buildCodeString = (worldName: string, role: AccessCodeRole) => {
	const worldTag = WORLD_TAGS[worldName] ?? worldName.slice(0, 3).toUpperCase();
	return `${worldTag}-${ROLE_TAGS[role]}-${randomDigits()}`;
};

export const listAccessCodes = async (): Promise<AccessCodeRow[]> => {
	const rows = await prisma.accessCode.findMany({
		where: { role: { in: ["resource_manager", "transit_officer", "commercial_citizen"] } },
		include: { world: true, usedBy: true },
		orderBy: { createdAt: "desc" },
	});

	return rows.map(row => ({
		id: row.id,
		code: row.codeString,
		worldId: row.worldId,
		worldName: row.world.name,
		role: row.role as AccessCodeRole,
		status: row.status as AccessCodeRow["status"],
		usedBy: row.usedBy?.name ?? null,
		createdAt: row.createdAt,
	}));
};

export const generateAccessCodes = async (
	worldId: number,
	role: AccessCodeRole,
	qty: number,
): Promise<AccessCodeRow[]> => {
	const world = await prisma.world.findUnique({ where: { id: worldId } });
	if (!world) return [];

	const createList = Array.from({ length: qty }, () => ({
		codeString: buildCodeString(world.name, role),
		worldId,
		role,
		status: "available" as const,
	}));

	const created = await prisma.$transaction(
		createList.map(data => prisma.accessCode.create({ data, include: { world: true, usedBy: true } })),
	);

	return created.map(row => ({
		id: row.id,
		code: row.codeString,
		worldId: row.worldId,
		worldName: row.world.name,
		role: row.role as AccessCodeRole,
		status: row.status as AccessCodeRow["status"],
		usedBy: row.usedBy?.name ?? null,
		createdAt: row.createdAt,
	}));
};

export const expireAccessCode = async (id: number): Promise<AccessCodeRow | null> => {
	const existing = await prisma.accessCode.findUnique({ where: { id } });
	if (!existing) return null;

	const updated = await prisma.accessCode.update({
		where: { id },
		data: { status: "expired" },
		include: { world: true, usedBy: true },
	});

	return {
		id: updated.id,
		code: updated.codeString,
		worldId: updated.worldId,
		worldName: updated.world.name,
		role: updated.role as AccessCodeRole,
		status: updated.status as AccessCodeRow["status"],
		usedBy: updated.usedBy?.name ?? null,
		createdAt: updated.createdAt,
	};
};
