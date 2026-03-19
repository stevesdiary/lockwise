import { Transaction } from 'sequelize';
import { Referrer } from '../../payment/models/referrer.model';
import { ReferralBonus } from '../models/referral.bonus.model';
import { Estate } from '../../estate/models/estate.model';
import notificationService from '../../communication/services/notification.service';

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
    const deleted = await Referrer.destroy({ where: { referrer_id: id } as any });
    return {
      statusCode: deleted ? 200 : 404,
      message: deleted ? 'Referrer deleted' : 'Referrer not found'
    };
  },

  // t is optional: pass the caller's transaction to make bonus + increment atomic with the payment
  async createBonusOnPayment(estateId: string, paymentAmount: number, t?: Transaction) {
    const estate = await Estate.findByPk(estateId, { transaction: t });
    if (!estate || !estate.referrer_id) return null;

    const bonusAmount = paymentAmount * REFERRAL_BONUS_PERCENTAGE;

    // Both writes share the transaction — if either fails the whole thing rolls back
    const bonus = await ReferralBonus.create(
      { referrer_id: estate.referrer_id, estate_id: estateId, bonus_amount: bonusAmount, paid: false },
      { transaction: t },
    );

    const referrer = await Referrer.findByPk(estate.referrer_id, { transaction: t });
    if (referrer) {
      await referrer.increment('total_earnings', { by: bonusAmount, transaction: t } as any);

      // Notification is fire-and-forget; intentionally outside the transaction
      notificationService.sendNotification({
        type: 'email',
        to: referrer.email,
        template: 'referralBonus',
        data: { name: referrer.name, bonus_amount: bonusAmount, estate_name: estate.name },
        priority: 'high',
      }).catch((err: Error) => console.error('Referral bonus notification failed:', err));
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
