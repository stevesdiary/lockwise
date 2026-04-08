import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Referrer } from '../models/referrer.model';
import { referrerPortalTokenType } from '../services/referral.service';

export interface ReferrerAuthRequest extends Request {
  referrer?: {
    id: string;
    email: string;
    name: string;
    phone?: string;
    referral_code: string;
  };
}

export const authenticateReferrer = async (req: ReferrerAuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Referrer access token required' });
  }

  if (!process.env.JWT_SECRET) {
    console.error('CRITICAL: JWT_SECRET is not configured');
    return res.status(500).json({ message: 'Server configuration error' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
      referrerId?: string;
      type?: string;
    };

    if (decoded.type !== referrerPortalTokenType || !decoded.referrerId) {
      return res.status(401).json({ message: 'Invalid referrer token' });
    }

    const referrer = await Referrer.findByPk(decoded.referrerId);
    if (!referrer) {
      return res.status(401).json({ message: 'Referrer not found' });
    }

    req.referrer = {
      id: referrer.id,
      email: referrer.email,
      name: referrer.name,
      phone: referrer.phone,
      referral_code: referrer.referral_code,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Referrer token expired' });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(403).json({ message: 'Invalid referrer token' });
    }

    return res.status(403).json({ message: 'Referrer authentication failed' });
  }
};
