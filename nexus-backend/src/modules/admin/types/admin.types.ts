export type ApprovalAction = "approve" | "reject";

export interface ApprovalQueueItem {
	id: number;
	name: string;
	role: string;
	worldId: number;
	worldName: string;
	code: string;
	submittedAt: Date;
}

export interface ApprovalResolveResult {
	id: number;
	status: "active" | "revoked";
}

export type AccessCodeRole = "resource_manager" | "transit_officer" | "commercial_citizen";

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
	status: "available" | "used" | "expired";
	usedBy: string | null;
	createdAt: Date;
}
