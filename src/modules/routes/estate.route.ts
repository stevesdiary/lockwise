import { Router, Request as ExpressRequest, Response } from 'express';
import estateController from './estate.controller';

const estateRouter = Router();

// Health check endpoint
estateRouter.get('/health', (req: ExpressRequest, res: Response) => {
  res.status(200).json({ message: "Healthy!" });
});

// Estate routes
estateRouter.post('/', async (req: ExpressRequest, res: Response) => {
  await estateController.createEstate(req, res);
});

estateRouter.get('/', async (req: ExpressRequest, res: Response) => {
  await estateController.getAllEstates(req, res);
});

estateRouter.get('/:estateId', async (req: ExpressRequest, res: Response) => {
  await estateController.getEstateById(req, res);
});

estateRouter.put('/:estateId', async (req: ExpressRequest, res: Response) => {
  await estateController.updateEstate(req, res);
});

estateRouter.delete('/:estateId', async (req: ExpressRequest, res: Response) => {
  await estateController.deleteEstate(req, res);
});

export default estateRouter;