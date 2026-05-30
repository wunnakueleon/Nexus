export type AuthRole = "admin" | "resource_manager" | "transit_officer" | "commercial_citizen";
export type AuthStatus = "active" | "pending" | "rejected" | "revoked";

export interface SignUpInput {
	name: string;
	username: string;
	password: string;
	inviteCode: string;
}

export interface SignInInput {
	username: string;
	password: string;
}

export interface AuthResponse {
	status: AuthStatus;
	role: AuthRole;
	name: string;
	worldId: number | null;
	worldName: string | null;
}
