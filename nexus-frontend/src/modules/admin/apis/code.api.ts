import api from "../../../api";
import type { AccessCodeRole, AccessCodeRow } from "../types/admin.types";

export const fetchAccessCodes = async (): Promise<AccessCodeRow[]> => {
	const { data } = await api.get<AccessCodeRow[]>("/admin/codes");
	return data;
};

export const generateAccessCodes = async (
	worldId: number,
	role: AccessCodeRole,
	qty: number,
): Promise<AccessCodeRow[]> => {
	const { data } = await api.post<AccessCodeRow[]>("/admin/codes/generate", { worldId, role, qty });
	return data;
};

export const expireAccessCode = async (id: number): Promise<AccessCodeRow> => {
	const { data } = await api.patch<AccessCodeRow>(`/admin/codes/${id}/expire`);
	return data;
};
