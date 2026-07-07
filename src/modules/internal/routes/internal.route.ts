import { Router, Request, Response } from 'express';
import { authenticateServiceToken } from '../middleware/service-auth.middleware';
import { internalService } from '../services/internal.service';

const router = Router();

router.use(authenticateServiceToken);

router.get('/dashboard', async (_req: Request, res: Response) => {
  try {
    const data = await internalService.getDashboardMetrics();
    res.json(data);
  } catch (err: any) {
    console.error('[internal/dashboard]', err);
    res.status(500).json({ error: 'Internal aggregation failed' });
  }
});

router.get('/businesses', async (_req: Request, res: Response) => {
  try {
    const data = await internalService.getBusinesses();
    res.json(data);
  } catch (err: any) {
    console.error('[internal/businesses]', err);
    res.status(500).json({ error: 'Internal aggregation failed' });
  }
});

router.get('/subscriptions', async (_req: Request, res: Response) => {
  try {
    const data = await internalService.getSubscriptions();
    res.json(data);
  } catch (err: any) {
    console.error('[internal/subscriptions]', err);
    res.status(500).json({ error: 'Internal aggregation failed' });
  }
});

export default router;
