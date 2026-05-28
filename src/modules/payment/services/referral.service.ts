import jwt from 'jsonwebtoken';
import { customAlphabet } from 'nanoid';
import { col, fn, Op, Transaction, where as sequelizeWhere } from 'sequelize';
import { Referrer } from '../../payment/models/referrer.model';
import { ReferralBonus } from '../models/referral.bonus.model';
import { Estate } from '../../estate/models/estate.model';
import notificationService from '../../communication/services/notification.service';
import emailService from '../../communication/services/email.service';

const REFERRAL_BONUS_PERCENTAGE = process.env.REFERRAL_BONUS_PERCENTAGE || 0.8 as any; // 8% bonus
const generateReferralCode = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);
const REFERRER_PORTAL_TOKEN_TTL = '7d';
const REFERRER_PORTAL_TOKEN_TYPE = 'referrer_portal';

const resolvePortalBaseUrl = (baseUrl?: string): string => {
  const fallbackBaseUrl =
    baseUrl?.trim() ||
    process.env.REFERRAL_PORTAL_BASE_URL?.trim() ||
    process.env.BASE_URL?.trim() ||
    'http://localhost:3002';

  return fallbackBaseUrl.replace(/\/+$/, '');
};

const buildReferralLink = (referralCode: string, baseUrl?: string): string => {
  const referralUrl = new URL('/referral-programme', `${resolvePortalBaseUrl(baseUrl)}/`);
  referralUrl.searchParams.set('ref', referralCode);
  return referralUrl.toString();
};

const createReferrerPortalToken = (referrer: Referrer): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign(
    {
      referrerId: referrer.id,
      type: REFERRER_PORTAL_TOKEN_TYPE,
    },
    process.env.JWT_SECRET,
    { expiresIn: REFERRER_PORTAL_TOKEN_TTL },
  );
};

const findReferrerByPortalCredentials = async (email: string, referralCode: string): Promise<Referrer | null> => {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedCode = referralCode.trim().toLowerCase();

  return Referrer.findOne({
    where: {
      [Op.and]: [
        sequelizeWhere(fn('LOWER', col('email')), normalizedEmail),
        sequelizeWhere(fn('LOWER', col('referral_code')), normalizedCode),
      ],
    } as any,
  });
};

const getReferrerPortalSummaryById = async (referrerId: string, baseUrl?: string) => {
  const referrer = await Referrer.findByPk(referrerId);
  if (!referrer) {
    return null;
  }

  const totalReferrals = await Estate.count({
    where: { referrer_id: referrerId } as any,
  });

  return {
    id: referrer.id,
    name: referrer.name,
    email: referrer.email,
    phone: referrer.phone,
    referral_code: referrer.referral_code,
    referral_link: buildReferralLink(referrer.referral_code, baseUrl),
    total_referrals: totalReferrals,
    total_earnings: Number(referrer.total_earnings || 0),
  };
};

export const referralService = {
  async registerReferrer(data: any, baseUrl?: string) {
    const referral_code = `REF-${generateReferralCode()}`;
    const referrer = await Referrer.create({ ...data, referral_code });

    const referral_link = buildReferralLink(referral_code, baseUrl);
    const portal_link = `${resolvePortalBaseUrl(baseUrl)}/referral-programme`;

    // Fire-and-forget — email failure must not roll back account creation
    emailService.sendReferrerWelcomeEmail(referrer.email, {
      name: referrer.name,
      referral_code,
      referral_link,
      portal_link,
    }).catch((err: Error) => console.error('Referrer welcome email failed:', err));

    return referrer;
  },

  async loginReferrer(email: string, referralCode: string, baseUrl?: string) {
    const referrer = await findReferrerByPortalCredentials(email, referralCode);
    if (!referrer) {
      return null;
    }

    const summary = await getReferrerPortalSummaryById(referrer.id, baseUrl);
    if (!summary) {
      return null;
    }

    return {
      token: createReferrerPortalToken(referrer),
      referrer: summary,
    };
  },

  async getReferrerPortalSummary(referrerId: string, baseUrl?: string) {
    return getReferrerPortalSummaryById(referrerId, baseUrl);
  },

  async getReferrerByCode(referral_code: string) {
    return await Referrer.findOne({ where: { referral_code } });
  },

  async getAllReferrers() {
    return await Referrer.findAll();
  },

  async deleteReferrerById(id: string) {
    const deleted = await Referrer.destroy({ where: { id } as any });
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

export const referrerPortalTokenType = REFERRER_PORTAL_TOKEN_TYPE;
