import { ReferralBonus } from '../models/referral.bonus.model';

export class ReferralBonusRepository {
  async exists(referrerId: string, estateId: string): Promise<boolean> {
    const bonus = await ReferralBonus.findOne({ where: { referrer_id: referrerId, estate_id: estateId } });
    return !!bonus;
  }

  async create(data: Partial<ReferralBonus>) {
    return ReferralBonus.create(data);
  }

  async getUnpaidBonuses(referrerId: string) {
    return ReferralBonus.findAll({ where: { referrer_id: referrerId, paid: false } });
  }

  async getBonusesByReferrer(referrerId: string): Promise<ReferralBonus[]> {
  return ReferralBonus.findAll({ where: { referrer_id: referrerId } });
}
}
