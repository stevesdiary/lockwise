import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

interface CsrfRequest extends Request {
  session?: {
    csrfToken?: string;
  };
}

export const generateCsrfToken = (req: CsrfRequest, res: Response, next: NextFunction) => {
  if (!req.session?.csrfToken) {
    req.session = req.session || {};
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }
  next();
};

export const verifyCsrfToken = (req: CsrfRequest, res: Response, next: NextFunction) => {
  const token = req.headers['x-csrf-token'] || req.body._csrf;
  
  if (!token || token !== req.session?.csrfToken) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }
  
  next();
};
