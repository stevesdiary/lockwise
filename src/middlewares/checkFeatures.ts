import { Request, Response, NextFunction } from 'express';
import { Estate } from '../models/estate.model';
import { Plan } from '../modules/payment/plan.model';

import { PlanFeatures } from '../types/plan.features';

export const checkFeature = (featureKey: keyof PlanFeatures) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const estateId = req.user?.estate_id;

    const estate = await Estate.findByPk(estateId, {
      include: [Plan],
    });

    const features = estate?.plan?.features as PlanFeatures;

    if (!features?.[featureKey] || (Array.isArray(features[featureKey]) && features[featureKey].length === 0)) {
      return res.status(403).json({
        message: `Feature "${featureKey}" is not available on this plan.`,
      });
    }

    next();
  };
};
