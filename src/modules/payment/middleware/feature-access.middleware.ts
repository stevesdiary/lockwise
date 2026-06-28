import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../auth/middleware/auth.middleware';
import { Subscription } from '../models/subscription.model';
import { FeatureName, getFeatureFlags } from '../types/feature-flags.types';

export function checkFeatureAccess(_featureName: FeatureName) {
  return async (_req: AuthRequest, _res: Response, next: NextFunction) => {
    // All features unlocked for all plans — skip checks
    next();
  };
}

// Middleware to check if manager portal is read-only (days 22-30 of lapsed state)
export async function checkManagerWriteAccess(
  _req: AuthRequest,
  _res: Response,
  next: NextFunction
) {
  // All features unlocked — no write restrictions
  next();
}
