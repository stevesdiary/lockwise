import { Request, Response } from 'express';
import { PlanService } from '../services/plan.service';

const planService = new PlanService();

export const PlanController = {
  getAll: async (req: Request, res: Response): Promise<Response> => {
    const result = await planService.getAllPlans();
    return res.status(result.success ? 200 : 404).json(result);
  },

  getOne: async (req: Request, res: Response): Promise<Response> => {
    const result = await planService.getPlanById(req.params.id);
    return res.status(result.success ? 200 : 404).json(result);
  },

  create: async (req: Request, res: Response): Promise<Response> => {
    const result = await planService.createPlan(req.body);
    return res.status(result.success ? 201 : 400).json(result);
  },

  update: async (req: Request, res: Response): Promise<Response> => {
    const result = await planService.updatePlan(req.params.id, req.body);
    return res.status(result.success ? 200 : 404).json(result);
  },

  delete: async (req: Request, res: Response): Promise<Response> => {
    const result = await planService.deletePlan(req.params.id);
    return res.status(result.success ? 200 : 404).json(result);
  }
};
