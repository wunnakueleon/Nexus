import type { Request, Response, NextFunction } from "express";
import * as ListingModel from "../models/listing.model";
import { createListingSchema, updateListingSchema } from "../schemas/listing.schema";
import type { ListingCategory } from "../../../generated/prisma/enums";
import { emitTo } from "../../../realtime/io";
import { Events, roleRoom } from "../../../realtime/events";

// The public board (Browse) is shared by all citizens, so a listing change is a
// citizen-wide signal. "My Items" also listens and refilters to the owner.
// Admins also hear it for the platform-overview active-listings count.
const emitListingUpdated = () => {
  emitTo(roleRoom("commercial_citizen"), Events.ListingUpdated);
  emitTo(roleRoom("admin"), Events.ListingUpdated);
};

interface AuthedRequest extends Request {
  user: { id: number; role: string; worldId: number };
}

// GET /commercial-marketplace/listings
export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, worldId, keyword } = req.query;

    const filters: ListingModel.FindAllFilters = {
      ...(category && { category: category as ListingCategory }),
      ...(worldId && { worldId: Number(worldId) }),
      ...(keyword && { keyword: String(keyword) }),
    };

    const listings = await ListingModel.findAll(filters);
    res.json(listings);
  } catch (err) {
    next(err);
  }
};

// GET /commercial-marketplace/listings/:id
export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const listing = await ListingModel.findById(Number(req.params.id));
    if (!listing || listing.status === "deleted") {
      res.status(404).json({ message: "Listing not found" });
      return;
    }
    res.json(listing);
  } catch (err) {
    next(err);
  }
};

// GET /commercial-marketplace/listings/me
export const getMyListings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as AuthedRequest;
    const listings = await ListingModel.findByUserId(user.id);
    res.json(listings);
  } catch (err) {
    next(err);
  }
};

// POST /commercial-marketplace/listings
export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = createListingSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const { user } = req as AuthedRequest;
    const listing = await ListingModel.create(user.id, {
      ...parsed.data,
      imageUrls: req.body.imageUrls,
    });
    emitListingUpdated();
    res.status(201).json(listing);
  } catch (err) {
    next(err);
  }
};

// PATCH /commercial-marketplace/listings/:id
export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = updateListingSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const { user } = req as AuthedRequest;
    const listing = await ListingModel.findById(Number(req.params.id));

    if (!listing || listing.status === "deleted") {
      res.status(404).json({ message: "Listing not found" });
      return;
    }
    if (listing.userId !== user.id) {
      res.status(403).json({ message: "You do not own this listing" });
      return;
    }
    if (listing.status !== "available") {
      res.status(400).json({ message: "Only available listings can be edited" });
      return;
    }

    const updated = await ListingModel.update(listing.id, {
      ...parsed.data,
      imageUrls: req.body.imageUrls,
    });
    emitListingUpdated();
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// DELETE /commercial-marketplace/listings/:id
export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as AuthedRequest;
    const listing = await ListingModel.findById(Number(req.params.id));

    if (!listing || listing.status === "deleted") {
      res.status(404).json({ message: "Listing not found" });
      return;
    }
    if (listing.userId !== user.id) {
      res.status(403).json({ message: "You do not own this listing" });
      return;
    }
    if (listing.status !== "available") {
      res.status(400).json({ message: "Only available listings can be deleted" });
      return;
    }

    await ListingModel.softDelete(listing.id);
    emitListingUpdated();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
