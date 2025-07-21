import { ReferralRepository } from '../repositories/referer.repository';
import { Referrer } from '../referrer/referrer.model';
import { customAlphabet } from 'nanoid';
import { ReferrerCreationAttributes } from '../../types/referrer.type';
import { validate } from 'uuid';

const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);

export class ReferralService {
  private repository = new ReferralRepository();

  async registerReferrer(validatedData: ReferrerCreationAttributes) {
    const finalReferralCode = await this.resolveReferralCode(validatedData.referral_code);
    if (!validatedData.referral_code) {
      validatedData.referral_code = nanoid(6);
    }

    return await this.repository.createReferrer({
      ...validatedData,
      referral_code: finalReferralCode,
      total_earnings: validatedData.total_earnings ?? 0 // Provide a default value if undefined
  });
  }

  private async resolveReferralCode(desiredCode?: string): Promise<string> {
    if (!desiredCode) return nanoid();

    const isTaken = await this.repository.isReferralCodeTaken(desiredCode);
    if (!isTaken) return desiredCode;

    
    for (let i = 0; i < 5; i++) {
      const suggestion = `${desiredCode}${Math.floor(Math.random() * 999)}`;
      if (!(await this.repository.isReferralCodeTaken(suggestion))) {
        return suggestion;
      }
    }
    return nanoid();
  }

  async getReferrerByCode(code: string): Promise<Referrer | null> {
    return await this.repository.findByCode(code);
  }

  async getReferrerById(id: string): Promise<Referrer | null> {
    return await this.repository.findById(id);
  }

  async getAllReferrers(): Promise<Referrer[]> {
    return await this.repository.getAllReferrers();
  }
}

export const referralService = new ReferralService();
