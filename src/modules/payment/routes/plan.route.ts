import { Router } from 'express';
import { PlanController } from '../controllers/plan.controller';
import { asyncHandler } from '../../../shared/middleware/error-handler.middleware';
import { authenticateToken, requireAdmin } from '../../../shared/middleware/auth.middleware';

const planRouter = Router();

// Public — anyone (including unauthenticated mobile app) can list plans
planRouter.get('/', asyncHandler(PlanController.getAll));
planRouter.get('/:id', asyncHandler(PlanController.getOne));

// Admin-only mutations
planRouter.post('/', authenticateToken, requireAdmin, asyncHandler(PlanController.create));
planRouter.put('/:id', authenticateToken, requireAdmin, asyncHandler(PlanController.update));
planRouter.delete('/:id', authenticateToken, requireAdmin, asyncHandler(PlanController.delete));

export default planRouter;