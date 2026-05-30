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
        const worldId = req.user?.worldId;
        if (!worldId) return void next(appError(401, "Unauthorized"));

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
        const userId = req.user?.id;
        if (!userId) return void next(appError(401, "Unauthorized"));

        const parsed = CreateShipmentSchema.safeParse(req.body);
        if (!parsed.success) return void next(appError(400, "Invalid request body"));

        const shipment = await createShipment(parsed.data, userId);
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
        const userId = req.user?.id;
        if (!userId) return void next(appError(401, "Unauthorized"));

        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) return void next(appError(400, "Invalid shipment ID"));

        const exists = await getShipmentById(id);
        if (!exists) return void next(appError(404, "Shipment not found"));

        const updated = await advanceShipmentStatus(id, userId);
        if (!updated) return void next(appError(400, "Shipment cannot be advanced from its current status"));

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
        const userId = req.user?.id;
        if (!userId) return void next(appError(401, "Unauthorized"));

        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) return void next(appError(400, "Invalid shipment ID"));

        const exists = await getShipmentById(id);
        if (!exists) return void next(appError(404, "Shipment not found"));

        const updated = await deliverShipment(id, userId);
        if (!updated) return void next(appError(400, "Shipment cannot be delivered from its current status"));

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
        const userId = req.user?.id;
        if (!userId) return void next(appError(401, "Unauthorized"));

        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) return void next(appError(400, "Invalid shipment ID"));

        const exists = await getShipmentById(id);
        if (!exists) return void next(appError(404, "Shipment not found"));

        const updated = await cancelShipment(id, userId);
        if (!updated) return void next(appError(400, "Only shipments in preparing status can be cancelled"));

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
        const userId = req.user?.id;
        if (!userId) return void next(appError(401, "Unauthorized"));

        const shipmentId = Number(req.params.id);
        if (!Number.isInteger(shipmentId) || shipmentId <= 0) {
            return void next(appError(400, "Invalid shipment ID"));
        }

        const exists = await getShipmentById(shipmentId);
        if (!exists) return void next(appError(404, "Shipment not found"));

        const parsed = CreateShipmentFlagSchema.safeParse(req.body);
        if (!parsed.success) return void next(appError(400, "Invalid request body"));

        const flag = await addShipmentFlag(shipmentId, parsed.data, userId);
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
