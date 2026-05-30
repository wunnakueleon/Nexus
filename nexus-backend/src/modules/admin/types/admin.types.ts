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
