import { Request, Response } from 'express';
import { referralService } from './referral.service';
import { referrerCreationSchema } from '../../utils/validator';

export const ReferralController = {
  async registerReferrer(req: Request, res: Response) {
    try {
      const validatedData = await referrerCreationSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });
      const referrer = await referralService.registerReferrer(validatedData);

      return res.status(201).json({
        message: 'Referrer registered successfully',
        data: referrer
      });
    } catch (error) {
      console.error('Error in referral registration:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  },

  async getReferrer(req: Request, res: Response) {
    try {
      const { code } = req.params;
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

  async listReferrers(req: Request, res: Response) {
    try {
      const referrers = await referralService.getAllReferrers();
      return res.status(200).json({ data: referrers });
    } catch (error) {
      console.error('Error listing referrers:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
};
