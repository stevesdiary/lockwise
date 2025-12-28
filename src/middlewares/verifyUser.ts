import { Request, Response, NextFunction } from 'express';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    verified: boolean;
    [key: string]: any;
  };
}

export const requireVerifiedUser = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      status: 'fail',
      message: 'Authentication required'
    });
    return;
  }

  if (!req.user.verified) {
    res.status(403).json({
      status: 'fail',
      message: 'Account verification required. Please verify your email before creating an estate.'
    });
    return;
  }

  next();
};