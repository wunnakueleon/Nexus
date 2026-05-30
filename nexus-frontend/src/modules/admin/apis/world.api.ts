import api from "../../../api";
import type { AdminWorldSummary } from "../types/admin.types";

export const fetchWorlds = async (): Promise<AdminWorldSummary[]> => {
	const { data } = await api.get<AdminWorldSummary[]>("/admin/worlds");
	return data;
};
