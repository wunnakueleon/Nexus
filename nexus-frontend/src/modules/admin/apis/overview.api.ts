import api from "../../../api";
import type { PlatformOverview } from "../types/admin.types";

export const fetchPlatformOverview = async (): Promise<PlatformOverview> => {
	const { data } = await api.get<PlatformOverview>("/admin/overview");
	return data;
};
