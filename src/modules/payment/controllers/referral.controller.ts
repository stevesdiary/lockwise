import { Request, Response } from 'express';
import { referralService } from '../../payment/services/referral.service';
import { referrerCreationSchema, referrerPortalLoginSchema } from '../../../shared/utils/validator';
import { asString } from '../../../shared/utils/param.util';
import { ReferrerAuthRequest } from '../middleware/referrer-auth.middleware';

const getReferralPortalBaseUrl = (req: Request): string => {
  const configuredBaseUrl = process.env.REFERRAL_PORTAL_BASE_URL?.trim();
  if (configuredBaseUrl) {
    return configuredBaseUrl;
  }

  const host = req.get('host');
  if (host) {
    return `${req.protocol}://${host}`;
  }

  return process.env.BASE_URL || 'http://localhost:3002';
};

export const ReferralController = {
  async applyAsReferrer(req: Request, res: Response) {
    try {
      const validatedData = await referrerCreationSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });
      const referrer = await referralService.registerReferrer(validatedData, getReferralPortalBaseUrl(req));

      return res.status(201).json({
        message: 'Application successful. Your referral code is ready.',
        data: {
          name: referrer.name,
          email: referrer.email,
          referral_code: referrer.referral_code,
        },
      });
    } catch (error: any) {
      console.error('Error in referrer application:', error);

      if (error.name === 'ValidationError') {
        return res.status(400).json({ message: 'Validation failed', errors: error.errors });
      }

      // Unique constraint on email — give a clear message
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ message: 'An account with this email already exists.' });
      }

      return res.status(500).json({ message: 'Internal server error' });
    }
  },

  async registerReferrer(req: Request, res: Response) {
    try {
      const validatedData = await referrerCreationSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true
      });
      const referrer = await referralService.registerReferrer(validatedData, getReferralPortalBaseUrl(req));

      return res.status(201).json({
        message: 'Referrer registered successfully',
        data: referrer
      });
    } catch (error: any) {
      console.error('Error in referral registration:', error);

      if (error.name === 'ValidationError') {
        return res.status(400).json({ message: 'Validation failed', errors: error.errors });
      }

      return res.status(500).json({ message: 'Internal server error' });
    }
  },

  async loginReferrer(req: Request, res: Response) {
    try {
      const validatedData = await referrerPortalLoginSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true
      });

      const result = await referralService.loginReferrer(
        validatedData.email,
        validatedData.referral_code,
        getReferralPortalBaseUrl(req)
      );

      if (!result) {
        return res.status(401).json({ message: 'Invalid email or referral code' });
      }

      return res.status(200).json({
        message: 'Referrer login successful',
        data: result
      });
    } catch (error: any) {
      console.error('Error logging in referrer:', error);

      if (error.name === 'ValidationError') {
        return res.status(400).json({ message: 'Validation failed', errors: error.errors });
      }

      return res.status(500).json({ message: 'Internal server error' });
    }
  },

  async getPortalSummary(req: ReferrerAuthRequest, res: Response) {
    try {
      if (!req.referrer?.id) {
        return res.status(401).json({ message: 'Referrer authentication required' });
      }

      const summary = await referralService.getReferrerPortalSummary(
        req.referrer.id,
        getReferralPortalBaseUrl(req)
      );

      if (!summary) {
        return res.status(404).json({ message: 'Referrer not found' });
      }

      return res.status(200).json({ data: summary });
    } catch (error) {
      console.error('Error fetching referrer portal summary:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  },

  async getReferrer(req: Request, res: Response) {
    try {
      const code = asString(req.params.code);
      const referrer = await referralService.getReferrerByCode(code);

      if (!referrer) {
        return res.status(404).json({ message: 'Referrer not found' });
      }

      return res.status(200).json({ data: referrer });
    } catch (error) {
      console.error('Error fetching referrer:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  },

  async listReferrers(_req: Request, res: Response) {
    try {
      const referrers = await referralService.getAllReferrers();
      return res.status(200).json({ data: referrers });
    } catch (error) {
      console.error('Error listing referrers:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  },

  async deleteReferrer(req: Request, res: Response) {
    try {
      const id = asString(req.params.id);
      const referrer = await referralService.deleteReferrerById(id);
      return res.status(referrer.statusCode).json({data: referrer});
    } catch (error) {
      console.error('Error deleting referrer:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  },

  async getUnpaidBonuses(_req: Request, res: Response) {
    try {
      const bonuses = await referralService.getUnpaidBonuses();
      return res.status(200).json({ data: bonuses });
    } catch (error) {
      console.error('Error fetching unpaid bonuses:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  },

  async getReferrerBonuses(req: Request, res: Response) {
    try {
      const referrerId = asString(req.params.referrerId);
      const bonuses = await referralService.getReferrerBonuses(referrerId);
      return res.status(200).json({ data: bonuses });
    } catch (error) {
      console.error('Error fetching referrer bonuses:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  },

  async markBonusAsPaid(req: Request, res: Response) {
    try {
      const bonusId = asString(req.params.bonusId);
      const { payment_reference } = req.body;
      
      const result = await referralService.markBonusAsPaid(bonusId, payment_reference);
      return res.status(result.statusCode).json(result);
    } catch (error) {
      console.error('Error marking bonus as paid:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
};
