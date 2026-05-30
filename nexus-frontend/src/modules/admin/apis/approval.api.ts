import api from "../../../api";
import type {
	ApprovalAction,
	ApprovalHistoryItem,
	ApprovalQueueItem,
	ApprovalResolveResult,
} from "../types/admin.types";

export const fetchApprovalQueue = async (): Promise<ApprovalQueueItem[]> => {
	const { data } = await api.get<ApprovalQueueItem[]>("/admin/approvals");
	return data;
};

export const resolveApproval = async (
	id: number,
	action: ApprovalAction,
): Promise<ApprovalResolveResult> => {
	const { data } = await api.patch<ApprovalResolveResult>(`/admin/approvals/${id}`, { action });
	return data;
};

export const fetchApprovalHistory = async (): Promise<ApprovalHistoryItem[]> => {
  const { data } = await api.get<ApprovalHistoryItem[]>("/admin/approvals/history");
  return data;
};
