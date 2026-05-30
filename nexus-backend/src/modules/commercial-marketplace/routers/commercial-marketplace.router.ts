import { Router } from "express";
import { authenticate } from "../../../middlewares/auth";
import { roleGuard } from "../../../middlewares/role_guard";
import * as listing from "../controllers/listing.controller";
import * as tradeOffer from "../controllers/trade-offer.controller";

const commercialMarketplaceRouter = Router();

const guard = [authenticate, roleGuard(["commercial_citizen"])];

// Listings
commercialMarketplaceRouter.get("/listings/my",  ...guard, listing.getMyListings);
commercialMarketplaceRouter.get("/listings/:id", ...guard, listing.getById);
commercialMarketplaceRouter.get("/listings",     ...guard, listing.list);
commercialMarketplaceRouter.post("/listings",    ...guard, listing.create);
commercialMarketplaceRouter.put("/listings/:id", ...guard, listing.update);
commercialMarketplaceRouter.delete("/listings/:id", ...guard, listing.remove);

// Trade offers
commercialMarketplaceRouter.get("/offers/incoming",         ...guard, tradeOffer.getIncoming);
commercialMarketplaceRouter.get("/offers/outgoing",         ...guard, tradeOffer.getOutgoing);
commercialMarketplaceRouter.get("/offers/completed",        ...guard, tradeOffer.getCompleted);
commercialMarketplaceRouter.post("/offers",                 ...guard, tradeOffer.create);
commercialMarketplaceRouter.patch("/offers/:id/accept",     ...guard, tradeOffer.accept);
commercialMarketplaceRouter.patch("/offers/:id/decline",    ...guard, tradeOffer.decline);
commercialMarketplaceRouter.delete("/offers/:id",           ...guard, tradeOffer.withdraw);

export default commercialMarketplaceRouter;
