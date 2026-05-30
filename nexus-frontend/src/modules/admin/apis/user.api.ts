import api from "../../../api";
import type { UserDirectoryRow } from "../types/admin.types";

export const fetchUsers = async (): Promise<UserDirectoryRow[]> => {
	const { data } = await api.get<UserDirectoryRow[]>("/admin/users");
	return data;
};

export const updateUserStatus = async (
	id: number,
	action: "revoke" | "reinstate",
): Promise<UserDirectoryRow> => {
	const { data } = await api.patch<UserDirectoryRow>(`/admin/users/${id}/status`, { action });
	return data;
};
