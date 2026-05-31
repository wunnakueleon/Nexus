import type { Request, Response, NextFunction } from 'express';
import { tradeModel } from '../models/trade.model';
import { createTradeSchema, respondTradeSchema } from '../schemas/trade.schema';
import { prisma } from '../../../db';
import { emitTo } from '../../../realtime/io';
import { Events, roleRoom } from '../../../realtime/events';
import { createShipmentFromResourceTrade } from '../../cargo-logistics/models/shipment.model';

// Trade views are filtered client-side by world, so a single role-wide signal
// covers every resource manager's incoming/outgoing/active/history tabs. Admins
// also hear it because the platform-overview trade count keys off the same data.
const emitTradeUpdated = () => {
  emitTo(roleRoom('resource_manager'), Events.TradeUpdated);
  emitTo(roleRoom('admin'), Events.TradeUpdated);
};

type IdParams = { id: string };

export const tradeController = {
  getByWorld: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const worldId = parseInt(req.query.worldId as string, 10);
      if (isNaN(worldId)) {
        res.status(400).json({ success: false, message: 'worldId query param is required' });
        return;
      }
      const data = await tradeModel.findByWorld(worldId);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  getById: async (req: Request<IdParams>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'Invalid id' });
        return;
      }
      const data = await tradeModel.findById(id);
      if (!data) {
        res.status(404).json({ success: false, message: 'Trade request not found' });
        return;
      }
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  create: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = createTradeSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, errors: parsed.error.issues });
        return;
      }

      // Resolve requestedByUserId from DB if not supplied by client
      let requestedByUserId = parsed.data.requestedByUserId;
      if (!requestedByUserId) {
        const user =
          await prisma.user.findFirst({ where: { worldId: parsed.data.fromWorldId, status: 'active' } }) ??
          await prisma.user.findFirst({ where: { status: 'active' } });
        if (!user) {
          res.status(400).json({ success: false, message: 'No active user found in system' });
          return;
        }
        requestedByUserId = user.id;
      }

      const data = await tradeModel.create({ ...parsed.data, requestedByUserId });
      emitTradeUpdated();
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  accept: async (req: Request<IdParams>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'Invalid id' });
        return;
      }
      const parsed = respondTradeSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, errors: parsed.error.issues });
        return;
      }

      // Resolve respondedByUserId — try toWorld first, fall back to any active user
      let respondedByUserId = parsed.data.respondedByUserId;
      if (!respondedByUserId) {
        const trade = await tradeModel.findById(id);
        if (!trade) {
          res.status(404).json({ success: false, message: 'Trade not found' });
          return;
        }
        const user =
          await prisma.user.findFirst({ where: { worldId: trade.toWorldId, status: 'active' } }) ??
          await prisma.user.findFirst({ where: { status: 'active' } });
        if (!user) {
          res.status(400).json({ success: false, message: 'No active user found in system' });
          return;
        }
        respondedByUserId = user.id;
      }

      const data = await tradeModel.accept(id, { ...parsed.data, respondedByUserId });
      emitTradeUpdated();

      // A successful trade auto-generates both delivery shipments (one per
      // world) in Cargo Logistics.
      try {
        const shipments = await createShipmentFromResourceTrade({
          id: data.id,
          fromWorldId: data.fromWorldId,
          toWorldId: data.toWorldId,
          resourceWanted: data.resourceWanted,
          quantityWanted: data.quantityWanted,
          resourceOffered: data.resourceOffered,
          quantityOffered: data.quantityOffered,
          respondedByUserId,
        });
        if (shipments.length) {
          emitTo(roleRoom('transit_officer'), Events.ShipmentUpdated);
          emitTo(roleRoom('admin'), Events.ShipmentUpdated);
        }
      } catch (shipErr) {
        // Don't fail the accepted trade if shipment creation hiccups.
        console.error('Failed to auto-create shipment for trade', data.id, shipErr);
      }

      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  decline: async (req: Request<IdParams>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'Invalid id' });
        return;
      }
      const parsed = respondTradeSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, errors: parsed.error.issues });
        return;
      }

      // Resolve respondedByUserId — try toWorld first, fall back to any active user
      let respondedByUserId = parsed.data.respondedByUserId;
      if (!respondedByUserId) {
        const trade = await tradeModel.findById(id);
        if (!trade) {
          res.status(404).json({ success: false, message: 'Trade not found' });
          return;
        }
        const user =
          await prisma.user.findFirst({ where: { worldId: trade.toWorldId, status: 'active' } }) ??
          await prisma.user.findFirst({ where: { status: 'active' } });
        if (!user) {
          res.status(400).json({ success: false, message: 'No active user found in system' });
          return;
        }
        respondedByUserId = user.id;
      }

      const data = await tradeModel.decline(id, { ...parsed.data, respondedByUserId });
      emitTradeUpdated();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  cancel: async (req: Request<IdParams>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'Invalid id' });
        return;
      }
      const data = await tradeModel.cancel(id);
      emitTradeUpdated();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  fulfill: async (req: Request<IdParams>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'Invalid id' });
        return;
      }
      const data = await tradeModel.fulfill(id);
      emitTradeUpdated();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },
};
