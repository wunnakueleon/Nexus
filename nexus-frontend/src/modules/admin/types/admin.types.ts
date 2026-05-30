export type ApprovalAction = "approve" | "reject";

export interface ApprovalQueueItem {
	id: number;
	name: string;
	role: string;
	worldId: number;
	worldName: string;
	code: string;
	submittedAt: string;
}

export interface ApprovalResolveResult {
	id: number;
	status: "active" | "revoked";
}

export type AccessCodeRole = "resource_manager" | "transit_officer" | "commercial_citizen";
export type AccessCodeStatus = "available" | "used" | "expired";

export interface AdminWorldSummary {
	id: number;
	name: string;
	colorHex: string;
}

export interface AccessCodeRow {
	id: number;
	code: string;
	worldId: number;
	worldName: string;
	role: AccessCodeRole;
	status: AccessCodeStatus;
	usedBy: string | null;
	createdAt: string;
}
