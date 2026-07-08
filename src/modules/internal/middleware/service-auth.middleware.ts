import { Request, Response, NextFunction } from 'express';

/**
 * Authenticates service-to-service calls from periscope.
 * Expects: Authorization: Bearer <PERISCOPE_SERVICE_TOKEN>
 */
export const authenticateServiceToken = (req: Request, res: Response, next: NextFunction) => {
  const expected = process.env.PERISCOPE_SERVICE_TOKEN;
  if (!expected) {
    return res.status(503).json({ error: 'Internal API not configured' });
  }

  const header = req.headers['authorization'];
  const token = header?.startsWith('Bearer ') ? header.slice(7) : '';

  if (!token || token !== expected) {
    return res.status(401).json({ error: 'Invalid service token' });
  }

  next();
};
