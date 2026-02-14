import { Router } from 'express';
import { PlanController } from '../controllers/plan.controller';
import { asyncHandler } from '../../../shared/middleware/error-handler.middleware';

const planRouter = Router();

planRouter.get('/', asyncHandler(PlanController.getAll));

planRouter.get('/:id', asyncHandler(PlanController.getOne));

planRouter.post('/', asyncHandler(PlanController.create));

planRouter.put('/:id', asyncHandler(PlanController.update));

planRouter.delete('/:id', asyncHandler(PlanController.delete));

export default planRouter;