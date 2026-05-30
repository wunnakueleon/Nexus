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

export type WorldStatus = "active" | "removed";

export type WorldRequestType = "addition" | "removal";
export type WorldRequestStatus = "pending" | "approved" | "rejected";
export type WorldRequestAction = "approve" | "reject";

export interface AdminWorldSummary {
	id: number;
	name: string;
	colorHex: string;
	status: WorldStatus;
	createdAt: Date;
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

export interface WorldRequestRow {
	id: number;
	requestType: WorldRequestType;
	worldName: string;
	worldId: number | null;
	colorHex: string | null;
	reason: string;
	status: WorldRequestStatus;
	requestedAt: Date;
	resolvedAt: Date | null;
}

export interface ApprovalHistoryItem {
	id: number;
	name: string;
	role: AccessCodeRole;
	worldId: number;
	worldName: string;
	status: "approved" | "rejected";
	resolvedAt: Date | null;
}
