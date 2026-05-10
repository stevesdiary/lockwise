import { Op } from 'sequelize';
import { Subscription } from '../../payment/models/subscription.model';
import { Plan } from '../../payment/models/plan.model';
import { estateWalletService } from './estate-wallet.service';
import { InsufficientBalanceError } from '../types/kuda.types';
import logger from '../../../shared/utils/logger';

const GRACE_PERIOD_DAYS = 7;

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export async function runSubscriptionAutoRenewal(): Promise<{ processed: number; renewed: number; failed: number }> {
  const now = new Date();
  const tomorrow = addDays(now, 1);

  const expiringSubscriptions = await Subscription.findAll({
    where: {
      status: 'active',
      wallet_payment_enabled: true,
      end_date: { [Op.between]: [now, tomorrow] },
    },
    include: [{ model: Plan }],
  });

  let renewed = 0;
  let failed = 0;

  for (const sub of expiringSubscriptions) {
    try {
      const plan = sub.plan;
      if (!plan?.price || plan.price <= 0) {
        logger.warn(`Subscription ${sub.id}: plan has no price, skipping auto-renewal`);
        failed++;
        continue;
      }

      const reference = `sub_autorenewal_${sub.id}_${Date.now()}`;
      await estateWalletService.debit(
        sub.estate_id,
        plan.price,
        `Auto-renewal: ${plan.name}`,
        'subscription',
        reference,
      );

      const newEndDate = addDays(sub.end_date, plan.duration || 30);
      await sub.update({ end_date: newEndDate, paid_on: now });

      logger.info(`Subscription ${sub.id} auto-renewed until ${newEndDate.toISOString()}`);
      renewed++;
    } catch (error: any) {
      if (error instanceof InsufficientBalanceError) {
        const gracePeriodEnd = addDays(sub.end_date, GRACE_PERIOD_DAYS);
        await sub.update({ status: 'grace_period', grace_period_end_date: gracePeriodEnd }).catch((e) =>
          logger.error(`Failed to set grace period for subscription ${sub.id}:`, e),
        );
        logger.warn(`Subscription ${sub.id}: insufficient balance, entered grace period`);
      } else {
        logger.error(`Subscription ${sub.id} auto-renewal error: ${(error.message || 'unknown').replace(/[\r\n]/g, '')}`);
      }
      failed++;
    }
  }

  return { processed: expiringSubscriptions.length, renewed, failed };
}
