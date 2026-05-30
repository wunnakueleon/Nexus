export type AuthRole = "admin" | "resource_manager" | "transit_officer" | "commercial_citizen";
export type AuthStatus = "active" | "pending" | "rejected" | "revoked";

export interface SignUpPayload {
	name: string;
	username: string;
	password: string;
	inviteCode: string;
}

export interface SignInPayload {
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
