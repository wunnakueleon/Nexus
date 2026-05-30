import { Router } from 'express';
import { resourceController } from '../controllers/resource.controller';
import { tradeController } from '../controllers/trade.controller';

const resourceExchangeRouter = Router();

// Resources
resourceExchangeRouter.get('/resources',          resourceController.getAll);
resourceExchangeRouter.get('/resources/:worldId', resourceController.getByWorld);
resourceExchangeRouter.put('/resources/:worldId', resourceController.update);

// Trades
resourceExchangeRouter.get('/trades',               tradeController.getByWorld);
resourceExchangeRouter.get('/trades/:id',           tradeController.getById);
resourceExchangeRouter.post('/trades',              tradeController.create);
resourceExchangeRouter.patch('/trades/:id/accept',  tradeController.accept);
resourceExchangeRouter.patch('/trades/:id/decline', tradeController.decline);
resourceExchangeRouter.patch('/trades/:id/cancel',  tradeController.cancel);
resourceExchangeRouter.patch('/trades/:id/fulfill', tradeController.fulfill);

export default resourceExchangeRouter;
