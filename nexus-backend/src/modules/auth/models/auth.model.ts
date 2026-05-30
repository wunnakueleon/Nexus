import bcrypt from "bcrypt";
import { prisma } from "../../../db";
import type { AuthResponse, SignInInput, SignUpInput } from "../types/auth.types";

const toAuthResponse = (user: {
	name: string;
	role: string;
	status: string;
	world?: { id: number; name: string } | null;
}): AuthResponse => {
	const status = user.role === "admin"
		? "active"
		: user.status === "pending"
			? "pending"
			: user.status === "revoked"
				? "rejected"
				: "active";

	return {
		status,
		role: user.role as AuthResponse["role"],
		name: user.name,
		worldId: user.role === "admin" ? null : user.world?.id ?? null,
		worldName: user.role === "admin" ? null : user.world?.name ?? null,
	};
};

export const signUpWithCode = async (input: SignUpInput): Promise<AuthResponse> => {
	const accessCode = await prisma.accessCode.findUnique({
		where: { codeString: input.inviteCode },
		include: { world: true },
	});

	if (!accessCode || accessCode.status !== "available") {
		const error = new Error("Invite code is invalid or already used") as Error & { status?: number };
		error.status = 400;
		throw error;
	}

	const existing = await prisma.user.findUnique({ where: { username: input.username } });
	if (existing) {
		const error = new Error("Username already exists") as Error & { status?: number };
		error.status = 409;
		throw error;
	}

	const passwordHash = await bcrypt.hash(input.password, 10);

	const user = await prisma.user.create({
		data: {
			name: input.name,
			username: input.username,
			passwordHash,
			worldId: accessCode.worldId,
			role: accessCode.role,
			status: "pending",
			codeId: accessCode.id,
		},
		include: { world: true },
	});

	await prisma.accessCode.update({
		where: { id: accessCode.id },
		data: { status: "used", usedByUserId: user.id, usedAt: new Date() },
	});

	return toAuthResponse(user);
};

export const signInWithCredentials = async (input: SignInInput): Promise<AuthResponse> => {
	const user = await prisma.user.findUnique({
		where: { username: input.username },
		include: { world: true },
	});

	if (!user) {
		const error = new Error("Invalid credentials") as Error & { status?: number };
		error.status = 401;
		throw error;
	}

	const matches = await bcrypt.compare(input.password, user.passwordHash);
	if (!matches) {
		const error = new Error("Invalid credentials") as Error & { status?: number };
		error.status = 401;
		throw error;
	}

	return toAuthResponse(user);
};
