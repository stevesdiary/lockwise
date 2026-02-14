import { Request, Response, NextFunction } from 'express';

export const verifyUser = (req: Request, res: Response, next: NextFunction) => {
  // Verify user logic
  next();
};
