import type { Request, Response, NextFunction } from 'express';
import { resourceModel } from '../models/resource.model';
import { updateStocksSchema } from '../schemas/resource.schema';

type WorldIdParams = { worldId: string };

export const resourceController = {
  getAll: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await resourceModel.findAll();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  getByWorld: async (req: Request<WorldIdParams>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const worldId = parseInt(req.params.worldId, 10);
      if (isNaN(worldId)) {
        res.status(400).json({ success: false, message: 'Invalid worldId' });
        return;
      }
      const data = await resourceModel.findByWorld(worldId);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  update: async (req: Request<WorldIdParams>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const worldId = parseInt(req.params.worldId, 10);
      if (isNaN(worldId)) {
        res.status(400).json({ success: false, message: 'Invalid worldId' });
        return;
      }
      const parsed = updateStocksSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, errors: parsed.error.issues });
        return;
      }
      const data = await resourceModel.updateByWorld(worldId, parsed.data.stocks);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },
};
