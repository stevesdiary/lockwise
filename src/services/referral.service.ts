import { Referrer } from '../models/referrer.model';
import { ReferralBonus } from '../models/referral.bonus.model';
import { Estate } from '../models/estate.model';
import notificationService from './notification.service';

const REFERRAL_BONUS_PERCENTAGE = 0.10; // 10% bonus

export const referralService = {
  async registerReferrer(data: any) {
    return await Referrer.create(data);
  },

  async getReferrerByCode(referral_code: string) {
    return await Referrer.findOne({ where: { referral_code } });
  },

  async getAllReferrers() {
    return await Referrer.findAll();
  },

  async deleteReferrerById(id: string) {
    const deleted = await Referrer.destroy({ where: { id } });
    return {
      statusCode: deleted ? 200 : 404,
      message: deleted ? 'Referrer deleted' : 'Referrer not found'
    };
  },

  async createBonusOnPayment(estateId: string, paymentAmount: number) {
    const estate = await Estate.findByPk(estateId);
    if (!estate || !estate.referrer_id) return null;

    const bonusAmount = paymentAmount * REFERRAL_BONUS_PERCENTAGE;
    
    const bonus = await ReferralBonus.create({
      referrer_id: estate.referrer_id,
      estate_id: estateId,
      bonus_amount: bonusAmount,
      paid: false
    });

    const referrer = await Referrer.findByPk(estate.referrer_id);
    if (referrer) {
      await referrer.increment('total_earnings', { by: bonusAmount });
      
      await notificationService.sendNotification({
        type: 'email',
        to: referrer.email,
        template: 'referralBonus',
        data: {
          name: referrer.name,
          bonus_amount: bonusAmount,
          estate_name: estate.name
        },
        priority: 'high'
      });
    }

    return bonus;
  },

  async getUnpaidBonuses() {
    return await ReferralBonus.findAll({
      where: { paid: false },
      include: [{ model: Referrer }, { model: Estate }]
    });
  },

  async getReferrerBonuses(referrerId: string) {
    return await ReferralBonus.findAll({
      where: { referrer_id: referrerId },
      include: [{ model: Estate }]
    });
  },

  async markBonusAsPaid(bonusId: string, paymentReference: string) {
    const bonus = await ReferralBonus.findByPk(bonusId);
    if (!bonus) {
      return { statusCode: 404, message: 'Bonus not found' };
    }

    await bonus.update({
      paid: true,
      payment_reference: paymentReference
    });

    return { statusCode: 200, message: 'Bonus marked as paid', data: bonus };
  }
};
