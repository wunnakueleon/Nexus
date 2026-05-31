import type { Request, Response, NextFunction } from "express";
import * as TradeOfferModel from "../models/trade-offer.model";
import * as ListingModel from "../models/listing.model";
import { createTradeOfferSchema } from "../schemas/trade-offer.schema";
import { createShipmentFromCommercialTrade } from "../../cargo-logistics/models/shipment.model";
import { emitTo } from "../../../realtime/io";
import { Events, roleRoom } from "../../../realtime/events";

// Every offer transition also flips listing statuses, so we signal the "My
// Trades" views (offer:updated) and the public board (listing:updated). The
// listing signal is mirrored to admins because the platform-overview
// "Marketplace Listings" count keys off the same listing statuses.
const emitOfferUpdated = () => {
  emitTo(roleRoom("commercial_citizen"), Events.OfferUpdated);
  emitTo(roleRoom("commercial_citizen"), Events.ListingUpdated);
  emitTo(roleRoom("admin"), Events.ListingUpdated);
};

interface AuthedRequest extends Request {
  user: { id: number; role: string; worldId: number };
}

// GET /commercial-marketplace/trade-offers/incoming
export const getIncoming = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as AuthedRequest;
    const offers = await TradeOfferModel.findIncoming(user.id);
    res.json(offers);
  } catch (err) {
    next(err);
  }
};

// GET /commercial-marketplace/trade-offers/outgoing
export const getOutgoing = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as AuthedRequest;
    const offers = await TradeOfferModel.findOutgoing(user.id);
    res.json(offers);
  } catch (err) {
    next(err);
  }
};

// GET /commercial-marketplace/trade-offers/completed
export const getCompleted = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as AuthedRequest;
    const offers = await TradeOfferModel.findCompleted(user.id);
    res.json(offers);
  } catch (err) {
    next(err);
  }
};

// POST /commercial-marketplace/trade-offers
export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = createTradeOfferSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const { user } = req as AuthedRequest;
    const { listingId, offeredListingId } = parsed.data;

    const [targetListing, offeredListing] = await Promise.all([
      ListingModel.findById(listingId),
      ListingModel.findById(offeredListingId),
    ]);

    if (!targetListing || targetListing.status === "deleted") {
      res.status(404).json({ message: "Target listing not found" });
      return;
    }
    if (!offeredListing || offeredListing.status === "deleted") {
      res.status(404).json({ message: "Offered listing not found" });
      return;
    }
    if (targetListing.status !== "available") {
      res.status(400).json({ message: "Target listing is not available for trade" });
      return;
    }
    if (offeredListing.status !== "available") {
      res.status(400).json({ message: "Offered listing is not available for trade" });
      return;
    }
    if (offeredListing.userId !== user.id) {
      res.status(403).json({ message: "You do not own the offered listing" });
      return;
    }
    if (targetListing.userId === user.id) {
      res.status(400).json({ message: "You cannot trade on your own listing" });
      return;
    }

    const offer = await TradeOfferModel.create({
      listingId,
      offeredListingId,
      buyerUserId: user.id,
      sellerUserId: targetListing.userId,
    });

    await Promise.all([
      ListingModel.update(listingId, { status: "in_pending_trade" }),
      ListingModel.update(offeredListingId, { status: "in_pending_trade" }),
    ]);

    emitOfferUpdated();
    res.status(201).json(offer);
  } catch (err) {
    next(err);
  }
};

// PATCH /commercial-marketplace/trade-offers/:id/accept
export const accept = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as AuthedRequest;
    const offerId = Number(req.params.id);

    const [incoming] = await TradeOfferModel.findIncoming(user.id).then((offers) =>
      offers.filter((o) => o.id === offerId),
    );

    if (!incoming) {
      res.status(404).json({ message: "Offer not found or already resolved" });
      return;
    }
    if (incoming.sellerUserId !== user.id) {
      res.status(403).json({ message: "Only the seller can accept this offer" });
      return;
    }

    const offer = await TradeOfferModel.updateStatus(offerId, "accepted");

    await Promise.all([
      ListingModel.update(offer.listingId, { status: "traded" }),
      ListingModel.update(offer.offeredListingId, { status: "traded" }),
    ]);

    // A successful barter auto-generates both delivery shipments (one per
    // world) in Cargo Logistics.
    try {
      const shipments = await createShipmentFromCommercialTrade(offer);
      if (shipments.length) {
        emitTo(roleRoom("transit_officer"), Events.ShipmentUpdated);
        emitTo(roleRoom("admin"), Events.ShipmentUpdated);
      }
    } catch (shipErr) {
      // Don't fail the accepted trade if shipment creation hiccups.
      console.error("Failed to auto-create shipment for offer", offer.id, shipErr);
    }

    emitOfferUpdated();
    res.json(offer);
  } catch (err) {
    next(err);
  }
};

// PATCH /commercial-marketplace/trade-offers/:id/decline
export const decline = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as AuthedRequest;
    const offerId = Number(req.params.id);

    const [incoming] = await TradeOfferModel.findIncoming(user.id).then((offers) =>
      offers.filter((o) => o.id === offerId),
    );

    if (!incoming) {
      res.status(404).json({ message: "Offer not found or already resolved" });
      return;
    }
    if (incoming.sellerUserId !== user.id) {
      res.status(403).json({ message: "Only the seller can decline this offer" });
      return;
    }

    const offer = await TradeOfferModel.updateStatus(offerId, "declined");

    await Promise.all([
      ListingModel.update(offer.listingId, { status: "available" }),
      ListingModel.update(offer.offeredListingId, { status: "available" }),
    ]);

    emitOfferUpdated();
    res.json(offer);
  } catch (err) {
    next(err);
  }
};

// PATCH /commercial-marketplace/trade-offers/:id/withdraw
export const withdraw = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as AuthedRequest;
    const offerId = Number(req.params.id);

    const [outgoing] = await TradeOfferModel.findOutgoing(user.id).then((offers) =>
      offers.filter((o) => o.id === offerId),
    );

    if (!outgoing) {
      res.status(404).json({ message: "Offer not found" });
      return;
    }
    if (outgoing.buyerUserId !== user.id) {
      res.status(403).json({ message: "Only the buyer can withdraw this offer" });
      return;
    }
    if (outgoing.status !== "pending") {
      res.status(400).json({ message: "Only pending offers can be withdrawn" });
      return;
    }

    const offer = await TradeOfferModel.updateStatus(offerId, "withdrawn");

    await Promise.all([
      ListingModel.update(offer.listingId, { status: "available" }),
      ListingModel.update(offer.offeredListingId, { status: "available" }),
    ]);

    emitOfferUpdated();
    res.json(offer);
  } catch (err) {
    next(err);
  }
};
