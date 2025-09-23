import { Referrer } from '../models/referrer.model';
import { Payment } from '../models/payment.model';

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
  }
};