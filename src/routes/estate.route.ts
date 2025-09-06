import { Router, Request as ExpressRequest, Response } from 'express';
import estateController from '../controllers/estate.controller';

const estateRouter = Router();

// Health check endpoint
estateRouter.get('/health', (req: ExpressRequest, res: Response) => {
  res.status(200).json({ message: "Healthy!" });
});

// Estate routes
estateRouter.post('/register', async (req: ExpressRequest, res: Response) => {
  await estateController.createEstate(req, res);
});

estateRouter.get('/estates', async (req: ExpressRequest, res: Response) => {
  await estateController.getAllEstates(req, res);
});

estateRouter.get('/one/:estateId', async (req: ExpressRequest, res: Response) => {
  await estateController.getEstateById(req, res);
});

estateRouter.put('/update/:estateId', async (req: ExpressRequest, res: Response) => {
  await estateController.updateEstate(req, res);
});

estateRouter.delete('/delete/:estateId', async (req: ExpressRequest, res: Response) => {
  await estateController.deleteEstate(req, res);
});

export default estateRouter;
