import type { Request, Response, NextFunction } from 'express';
import { tradeModel } from '../models/trade.model';
import { createTradeSchema, respondTradeSchema } from '../schemas/trade.schema';

export const tradeController = {
  getByWorld: async (req: Request, res: Response, next: NextFunction) => {
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

  getById: async (req: Request, res: Response, next: NextFunction) => {
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

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = createTradeSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, errors: parsed.error.flatten() });
        return;
      }
      const data = await tradeModel.create(parsed.data);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  accept: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'Invalid id' });
        return;
      }
      const parsed = respondTradeSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, errors: parsed.error.flatten() });
        return;
      }
      const data = await tradeModel.accept(id, parsed.data);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  decline: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'Invalid id' });
        return;
      }
      const parsed = respondTradeSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, errors: parsed.error.flatten() });
        return;
      }
      const data = await tradeModel.decline(id, parsed.data);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  cancel: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'Invalid id' });
        return;
      }
      const data = await tradeModel.cancel(id);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  fulfill: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'Invalid id' });
        return;
      }
      const data = await tradeModel.fulfill(id);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },
};
