import { Request, Response } from 'express';
import { referralService } from '../services/referral.service';
import { referrerCreationSchema } from '../utils/validator';

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
  },

  async deleteReferrer(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const referrer = await referralService.deleteReferrerById(id);
      return res.status(referrer.statusCode).json({data: referrer});
    } catch (error) {
      console.error('Error deleting referrer:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  },

  async getUnpaidBonuses(req: Request, res: Response) {
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
      const { referrerId } = req.params;
      const bonuses = await referralService.getReferrerBonuses(referrerId);
      return res.status(200).json({ data: bonuses });
    } catch (error) {
      console.error('Error fetching referrer bonuses:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  },

  async markBonusAsPaid(req: Request, res: Response) {
    try {
      const { bonusId } = req.params;
      const { payment_reference } = req.body;
      
      const result = await referralService.markBonusAsPaid(bonusId, payment_reference);
      return res.status(result.statusCode).json(result);
    } catch (error) {
      console.error('Error marking bonus as paid:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
};
