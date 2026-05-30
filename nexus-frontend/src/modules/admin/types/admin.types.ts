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

export type WorldStatus = "active" | "removed";
export type WorldRequestType = "addition" | "removal";
export type WorldRequestStatus = "pending" | "approved" | "rejected";
export type WorldRequestAction = "approve" | "reject";

export interface AdminWorldSummary {
	id: number;
	name: string;
	colorHex: string;
	status: WorldStatus;
	createdAt: string;
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

export interface WorldRequestRow {
	id: number;
	requestType: WorldRequestType;
	worldName: string;
	worldId: number | null;
	colorHex: string | null;
	reason: string;
	status: WorldRequestStatus;
	requestedAt: string;
	resolvedAt: string | null;
}

export interface ApprovalHistoryItem {
	id: number;
	name: string;
	role: AccessCodeRole;
	worldId: number;
	worldName: string;
	status: "approved" | "rejected";
	resolvedAt: string | null;
}

export interface UserDirectoryRow {
	id: number;
	name: string;
	role: AccessCodeRole;
	worldId: number;
	worldName: string;
	status: "active" | "revoked";
	approvedAt: string | null;
}


// --- Platform Overview ------------------------------------------------------

export interface WorldOperatorCount {
	worldId: number;
	worldName: string;
	colorHex: string;
	activeOperators: number;
}

export interface PlatformOverview {
	activeOperators: number;
	pendingApprovals: number;
	availableCodes: number;
	usedCodes: number;
	activeTradeRequests: number;
	activeShipments: number;
	activeListings: number;
	operatorsPerWorld: WorldOperatorCount[];
}
