import { Router } from "express";
import authRouter from "./modules/auth/routers/auth.router";
import adminRouter from "./modules/admin/routers/admin.router";
import resourceExchangeRouter from "./modules/resource-exchange/routers/resource-exchange.router";
import cargoLogisticsRouter from "./modules/cargo-logistics/routers/cargo-logistics.router";
import commercialMarketplaceRouter from "./modules/commercial-marketplace/routers/commercial-marketplace.router";

const mainRouter = Router();

mainRouter.use("/auth", authRouter);
mainRouter.use("/admin", adminRouter);
mainRouter.use("/resource-exchange", resourceExchangeRouter);
mainRouter.use("/cargo-logistics", cargoLogisticsRouter);
mainRouter.use("/api/commercial-marketplace", commercialMarketplaceRouter);

export default mainRouter;
