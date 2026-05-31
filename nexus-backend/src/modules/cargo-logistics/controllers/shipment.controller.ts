import type { Request, Response, NextFunction } from "express";
import {
    CreateShipmentFlagSchema,
    CreateShipmentSchema,
    ShipmentFiltersSchema,
} from "../schemas/shipment.schema";
import {
    addShipmentFlag,
    advanceShipmentStatus,
    cancelShipment,
    createShipment,
    deliverShipment,
    getRouteOverview,
    getShipmentById,
    listShipments,
} from "../models/shipment.model";
import { emitTo } from "../../../realtime/io";
import { Events, roleRoom } from "../../../realtime/events";

// The board, detail and route-overview pages all filter client-side, so one
// role-wide signal keeps every transit officer's views in sync. Admins also
// hear it for the platform-overview active-shipments count.
const emitShipmentUpdated = () => {
    emitTo(roleRoom("transit_officer"), Events.ShipmentUpdated);
    emitTo(roleRoom("admin"), Events.ShipmentUpdated);
};

interface AuthRequest extends Request {
    user?: {
        id: number;
        worldId: number;
        role: string;
    };
}

function appError(status: number, message: string): Error & { status: number } {
    const err = new Error(message) as Error & { status: number };
    err.status = status;
    return err;
}

export async function listShipmentsHandler(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        // TODO: replace query-param scoping with req.user.worldId once auth is implemented
        const worldId = req.user?.worldId ?? (Number(req.query.worldId) || 1);

        const parsed = ShipmentFiltersSchema.safeParse(req.query);
        if (!parsed.success) return void next(appError(400, "Invalid query parameters"));

        const shipments = await listShipments(worldId, parsed.data);
        res.json(shipments);
    } catch (err) {
        next(err);
    }
}

export async function getShipmentHandler(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) return void next(appError(400, "Invalid shipment ID"));

        const shipment = await getShipmentById(id);
        if (!shipment) return void next(appError(404, "Shipment not found"));

        res.json(shipment);
    } catch (err) {
        next(err);
    }
}

export async function createShipmentHandler(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        // TODO: remove fallback once auth middleware is implemented
        const userId = req.user?.id ?? 1;

        const parsed = CreateShipmentSchema.safeParse(req.body);
        if (!parsed.success) return void next(appError(400, "Invalid request body"));

        const shipment = await createShipment(parsed.data, userId);
        emitShipmentUpdated();
        res.status(201).json(shipment);
    } catch (err) {
        next(err);
    }
}

export async function advanceShipmentHandler(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        // TODO: remove fallback once auth middleware is implemented
        const userId = req.user?.id ?? 1;

        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) return void next(appError(400, "Invalid shipment ID"));

        const exists = await getShipmentById(id);
        if (!exists) return void next(appError(404, "Shipment not found"));

        const updated = await advanceShipmentStatus(id, userId);
        if (!updated) return void next(appError(400, "Shipment cannot be advanced from its current status"));

        emitShipmentUpdated();
        res.json(updated);
    } catch (err) {
        next(err);
    }
}

export async function deliverShipmentHandler(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        // TODO: remove fallback once auth middleware is implemented
        const userId = req.user?.id ?? 1;

        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) return void next(appError(400, "Invalid shipment ID"));

        const exists = await getShipmentById(id);
        if (!exists) return void next(appError(404, "Shipment not found"));

        const updated = await deliverShipment(id, userId);
        if (!updated) return void next(appError(400, "Shipment cannot be delivered from its current status"));

        emitShipmentUpdated();
        res.json(updated);
    } catch (err) {
        next(err);
    }
}

export async function cancelShipmentHandler(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        // TODO: remove fallback once auth middleware is implemented
        const userId = req.user?.id ?? 1;

        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) return void next(appError(400, "Invalid shipment ID"));

        const exists = await getShipmentById(id);
        if (!exists) return void next(appError(404, "Shipment not found"));

        const updated = await cancelShipment(id, userId);
        if (!updated) return void next(appError(400, "Only shipments in preparing status can be cancelled"));

        emitShipmentUpdated();
        res.json(updated);
    } catch (err) {
        next(err);
    }
}

export async function addFlagHandler(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        // TODO: remove fallback once auth middleware is implemented
        const userId = req.user?.id ?? 1;

        const shipmentId = Number(req.params.id);
        if (!Number.isInteger(shipmentId) || shipmentId <= 0) {
            return void next(appError(400, "Invalid shipment ID"));
        }

        const exists = await getShipmentById(shipmentId);
        if (!exists) return void next(appError(404, "Shipment not found"));

        const parsed = CreateShipmentFlagSchema.safeParse(req.body);
        if (!parsed.success) return void next(appError(400, "Invalid request body"));

        const flag = await addShipmentFlag(shipmentId, parsed.data, userId);
        emitShipmentUpdated();
        res.status(201).json(flag);
    } catch (err) {
        next(err);
    }
}

export async function getRouteOverviewHandler(
    _req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const overview = await getRouteOverview();
        res.json(overview);
    } catch (err) {
        next(err);
    }
}
