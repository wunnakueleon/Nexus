import api from "../../../api";
import type {
    CreateShipmentFlagInput,
    CreateShipmentInput,
    RouteOverviewResponse,
    ShipmentDetail,
    ShipmentFilters,
    ShipmentFlagData,
    ShipmentSummary,
} from "../types/cargo-logistics.types";

const BASE = "/cargo-logistics/shipments";

// TODO: drop the `worldId` arg once auth provides the scoping world server-side
export async function getShipments(filters?: ShipmentFilters, worldId?: number): Promise<ShipmentSummary[]> {
    const params = { ...filters, ...(worldId ? { worldId } : {}) };
    const { data } = await api.get<ShipmentSummary[]>(BASE, { params });
    return data;
}

export async function getShipment(id: number): Promise<ShipmentDetail> {
    const { data } = await api.get<ShipmentDetail>(`${BASE}/${id}`);
    return data;
}

export async function createShipment(body: CreateShipmentInput): Promise<ShipmentDetail> {
    const { data } = await api.post<ShipmentDetail>(BASE, body);
    return data;
}

export async function advanceShipment(id: number): Promise<ShipmentDetail> {
    const { data } = await api.patch<ShipmentDetail>(`${BASE}/${id}/advance`);
    return data;
}

export async function deliverShipment(id: number): Promise<ShipmentDetail> {
    const { data } = await api.patch<ShipmentDetail>(`${BASE}/${id}/deliver`);
    return data;
}

export async function cancelShipment(id: number): Promise<ShipmentDetail> {
    const { data } = await api.patch<ShipmentDetail>(`${BASE}/${id}/cancel`);
    return data;
}

export async function addFlag(id: number, body: CreateShipmentFlagInput): Promise<ShipmentFlagData> {
    const { data } = await api.post<ShipmentFlagData>(`${BASE}/${id}/flags`, body);
    return data;
}

export async function getRouteOverview(): Promise<RouteOverviewResponse> {
    const { data } = await api.get<RouteOverviewResponse>(`${BASE}/routes/overview`);
    return data;
}
