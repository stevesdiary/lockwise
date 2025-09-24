import { Request, Response, NextFunction } from 'express';

export const requireVerifiedUser = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      status: 'fail',
      message: 'Authentication required'
    });
  }

  if (!req.user.verified) {
    return res.status(403).json({
      status: 'fail',
      message: 'Account verification required. Please verify your email before creating an estate.'
    });
  }

  next();
};