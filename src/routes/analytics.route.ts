import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';
import authentication from '../middlewares/authentication';
import authorizeRoles from '../middlewares/authorizeRoles';

const analyticsRouter = Router();

analyticsRouter.get('/revenue', 
  authentication, 
  authorizeRoles(['admin', 'manager']), 
  analyticsController.getRevenue
);

analyticsRouter.get('/stats', 
  authentication, 
  authorizeRoles(['admin']), 
  analyticsController.getSystemStats
);

export default analyticsRouter;