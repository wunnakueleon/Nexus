import api from "../../../api";
import type {
	AdminWorldSummary,
	WorldRequestAction,
	WorldRequestRow,
	WorldRequestType,
} from "../types/admin.types";

export const fetchWorlds = async (): Promise<AdminWorldSummary[]> => {
	const { data } = await api.get<AdminWorldSummary[]>("/admin/worlds");
	return data;
};

export const updateWorld = async (id: number, name: string, colorHex: string): Promise<AdminWorldSummary> => {
	const { data } = await api.patch<AdminWorldSummary>(`/admin/worlds/${id}`, { name, colorHex });
	return data;
};

export const fetchPendingWorldRequests = async (): Promise<WorldRequestRow[]> => {
	const { data } = await api.get<WorldRequestRow[]>("/admin/world-requests/pending");
	return data;
};

export const fetchWorldRequestHistory = async (): Promise<WorldRequestRow[]> => {
	const { data } = await api.get<WorldRequestRow[]>("/admin/world-requests/history");
	return data;
};

export const submitWorldRequest = async (payload: {
	requestType: WorldRequestType;
	worldName: string;
	worldId?: number | null;
	colorHex?: string | null;
	reason: string;
}): Promise<WorldRequestRow> => {
	const { data } = await api.post<WorldRequestRow>("/admin/world-requests", payload);
	return data;
};

export const resolveWorldRequest = async (id: number, action: WorldRequestAction): Promise<WorldRequestRow> => {
	const { data } = await api.patch<WorldRequestRow>(`/admin/world-requests/${id}`, { action });
	return data;
};
