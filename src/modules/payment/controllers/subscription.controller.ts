import { Response } from 'express';
import { AuthRequest } from '../../../shared/middleware/auth.middleware';
import enhancedSubscriptionService from '../services/enhanced-subscription.service';
import { Plan } from '../models/plan.model';

class SubscriptionController {
  async selectPlan(req: AuthRequest, res: Response) {
    try {
      const estateId = Array.isArray(req.params.estateId) ? req.params.estateId[0] : req.params.estateId;
      const { plan_id, billing_cycle } = req.body;

      if (!req.user) {
        return res.status(401).json({
          statusCode: 401,
          status: 'error',
          message: 'Authentication required',
        });
      }

      // Verify estate_id matches authenticated user
      if (req.user.estate_id && req.user.estate_id !== estateId) {
        return res.status(403).json({
          statusCode: 403,
          status: 'error',
          message: 'Unauthorized access to this estate',
        });
      }

      if (!plan_id || !billing_cycle) {
        return res.status(400).json({
          statusCode: 400,
          status: 'error',
          message: 'plan_id and billing_cycle are required',
        });
      }

      const result = await enhancedSubscriptionService.selectPlan({
        estateId,
        planId: plan_id,
        billingCycle: billing_cycle,
        userId: req.user.id,
        userEmail: req.user.email,
      });

      return res.status(result.statusCode).json(result);
    } catch (error: any) {
      console.error('Select plan error:', error);
      return res.status(500).json({
        statusCode: 500,
        status: 'error',
        message: error.message || 'Failed to select plan',
      });
    }
  }

  async getSubscriptionStatus(req: AuthRequest, res: Response) {
    try {
      const estateId = Array.isArray(req.params.estateId) ? req.params.estateId[0] : req.params.estateId;

      const result = await enhancedSubscriptionService.getSubscriptionStatus(estateId);

      return res.status(result.statusCode).json(result);
    } catch (error: any) {
      console.error('Get subscription status error:', error);
      return res.status(500).json({
        statusCode: 500,
        status: 'error',
        message: error.message || 'Failed to get subscription status',
      });
    }
  }

  async getFeatures(req: AuthRequest, res: Response) {
    try {
      const estateId = Array.isArray(req.params.estateId) ? req.params.estateId[0] : req.params.estateId;

      const result = await enhancedSubscriptionService.getFeatures(estateId);

      return res.status(result.statusCode).json(result);
    } catch (error: any) {
      console.error('Get features error:', error);
      return res.status(500).json({
        statusCode: 500,
        status: 'error',
        message: error.message || 'Failed to get features',
      });
    }
  }

  async upgradePlan(req: AuthRequest, res: Response) {
    try {
      const estateId = Array.isArray(req.params.estateId) ? req.params.estateId[0] : req.params.estateId;
      const { new_plan_id, billing_cycle } = req.body;

      if (!req.user) {
        return res.status(401).json({
          statusCode: 401,
          status: 'error',
          message: 'Authentication required',
        });
      }

      if (req.user.estate_id && req.user.estate_id !== estateId) {
        return res.status(403).json({
          statusCode: 403,
          status: 'error',
          message: 'Unauthorized access to this estate',
        });
      }

      if (!new_plan_id || !billing_cycle) {
        return res.status(400).json({
          statusCode: 400,
          status: 'error',
          message: 'new_plan_id and billing_cycle are required',
        });
      }

      // For now, treat upgrade same as select plan
      // TODO: Implement prorated billing logic
      const result = await enhancedSubscriptionService.selectPlan({
        estateId,
        planId: new_plan_id,
        billingCycle: billing_cycle,
        userId: req.user.id,
        userEmail: req.user.email,
      });

      return res.status(result.statusCode).json(result);
    } catch (error: any) {
      console.error('Upgrade plan error:', error);
      return res.status(500).json({
        statusCode: 500,
        status: 'error',
        message: error.message || 'Failed to upgrade plan',
      });
    }
  }

  async getAvailablePlans(req: AuthRequest, res: Response) {
    try {
      const plans = await Plan.findAll({
        where: {},
        order: [
          ['plan_tier', 'ASC'],
          ['billing_cycle', 'ASC'],
        ],
      });

      // Group plans by tier
      const groupedPlans = plans.reduce((acc: any, plan: any) => {
        const tier = plan.plan_tier || 'other';
        if (!acc[tier]) {
          acc[tier] = [];
        }
        acc[tier].push(plan);
        return acc;
      }, {});

      return res.status(200).json({
        statusCode: 200,
        status: 'success',
        data: {
          plans: groupedPlans,
          all_plans: plans,
        },
      });
    } catch (error: any) {
      console.error('Get available plans error:', error);
      return res.status(500).json({
        statusCode: 500,
        status: 'error',
        message: error.message || 'Failed to get available plans',
      });
    }
  }
}

export default new SubscriptionController();
