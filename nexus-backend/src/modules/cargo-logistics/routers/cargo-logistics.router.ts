import { Router } from "express";
import {
    addFlagHandler,
    advanceShipmentHandler,
    cancelShipmentHandler,
    createShipmentHandler,
    deliverShipmentHandler,
    getRouteOverviewHandler,
    getShipmentHandler,
    listShipmentsHandler,
} from "../controllers/shipment.controller";

const cargoLogisticsRouter = Router();

// Must be registered before /shipments/:id to prevent "routes" matching as :id
cargoLogisticsRouter.get("/shipments/routes/overview", getRouteOverviewHandler);

cargoLogisticsRouter.get("/shipments", listShipmentsHandler);
cargoLogisticsRouter.post("/shipments", createShipmentHandler);
cargoLogisticsRouter.get("/shipments/:id", getShipmentHandler);
cargoLogisticsRouter.patch("/shipments/:id/advance", advanceShipmentHandler);
cargoLogisticsRouter.patch("/shipments/:id/deliver", deliverShipmentHandler);
cargoLogisticsRouter.patch("/shipments/:id/cancel", cancelShipmentHandler);
cargoLogisticsRouter.post("/shipments/:id/flags", addFlagHandler);

export default cargoLogisticsRouter;
