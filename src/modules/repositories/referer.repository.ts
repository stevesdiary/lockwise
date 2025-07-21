import { ReferrerAttributes } from '../../types/referrer.type';
import { Referrer } from '../referrer/referrer.model';

export class ReferralRepository {
  async createReferrer(data: ReferrerAttributes ): Promise<Referrer> {
    return await Referrer.create(data);
  }

  async findByCode(code: string): Promise<Referrer | null> {
    return await Referrer.findOne({ 
      where: { 
        referral_code: code 
      } 
    });
  }

  async isReferralCodeTaken(code: string): Promise<boolean> {
    const existing = await Referrer.findOne({ 
      where: { 
        referral_code: code 
      } 
    });
    return !!existing;
  }

  async findById(id: string): Promise<Referrer | null> {
    return await Referrer.findByPk(id);
  }

  async getAllReferrers(): Promise<Referrer[]> {
    return await Referrer.findAll();
  }
}
