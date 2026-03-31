import crypto from 'crypto';
import { Transaction } from 'sequelize';
import sequelize from '../../../shared/core/database';
import { Payment } from '../../payment/models/payment.model';
import { Subscription } from '../../payment/models/subscription.model';
import { Plan } from '../../payment/models/plan.model';
import { Estate } from '../../estate/models/estate.model';
import { User } from '../../auth/models/user.model';

interface WebhookResult {
  success: boolean;
  message: string;
  statusCode: number;
}

export const webhookService = {
  verifyPaystackSignature(body: any, signature: string): boolean {
    if (!process.env.PAYSTACK_SECRET_KEY) {
      throw new Error('PAYSTACK_SECRET_KEY not configured');
    }

    const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(body))
      .digest('hex');

    return hash === signature;
  },

  async processPaystackWebhook(event: string, data: any): Promise<WebhookResult> {
    try {
      if (event === 'charge.success') {
        if (!data.reference) {
          return { success: false, message: 'Missing payment reference', statusCode: 400 };
        }

        // Atomically: mark payment completed + activate subscription + record referral bonus
        await sequelize.transaction(
          { isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE },
          async (t) => {
            const [updatedRows] = await Payment.update(
              { payment_status: 'completed', payment_data: data },
              { where: { reference: data.reference }, transaction: t }
            );

            if (updatedRows === 0) {
              throw new Error('PAYMENT_NOT_FOUND');
            }

            const payment = await Payment.findOne({
              where: { reference: data.reference },
              transaction: t,
            });

            if (payment) {
              await this.createOrExtendSubscription(payment, t);

              // Referral bonus: run inside the same transaction so it rolls back together
              if (payment.estate_id) {
                const { referralService } = require('./referral.service');
                await referralService.createBonusOnPayment(
                  payment.estate_id,
                  data.amount / 100,
                  t,
                );
              }
            }
          }
        );

        // Send receipt email after transaction commits (external I/O must not run inside DB transaction)
        this.sendSubscriptionReceiptEmail(data.reference).catch((err: Error) => {
          console.error('Subscription receipt email failed:', err);
        });

        return { success: true, message: 'Webhook processed successfully', statusCode: 200 };
      }

      return { success: true, message: 'Event not handled', statusCode: 200 };
    } catch (error) {
      if (error instanceof Error && error.message === 'PAYMENT_NOT_FOUND') {
        return { success: false, message: 'Payment not found', statusCode: 404 };
      }
      throw new Error(`Webhook processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async sendSubscriptionReceiptEmail(reference: string): Promise<void> {
    const payment = await Payment.findOne({ where: { reference } });
    if (!payment || !payment.estate_id) return;

    const [subscription, estate] = await Promise.all([
      Subscription.findOne({
        where: { estate_id: payment.estate_id, status: 'active' },
        include: [Plan],
        order: [['created_at', 'DESC']],
      }),
      Estate.findByPk(payment.estate_id),
    ]);

    if (!subscription || !estate) return;

    // Find the estate manager (creator or any manager-role user for this estate)
    const manager = await User.findOne({
      where: { estate_id: payment.estate_id, id: payment.user_id } as any,
    }) ?? await User.findOne({ where: { estate_id: payment.estate_id } as any });

    if (!manager?.email) return;

    const plan: any = subscription.plan;
    const formatDate = (d: Date) => new Date(d).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'long', year: 'numeric',
    });
    const formatAmount = (kobo: number) => (kobo / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 });

    const emailService = (await import('../../communication/services/email.service')).default;
    await emailService.sendSubscriptionReceiptEmail(manager.email, {
      manager_name: `${manager.first_name} ${manager.last_name}`.trim(),
      estate_name: estate.name,
      plan_name: plan?.name || 'Lockwise Plan',
      billing_cycle: plan?.billing_cycle || 'N/A',
      start_date: formatDate(subscription.start_date),
      end_date: formatDate(subscription.end_date),
      amount: formatAmount(payment.amount),
      currency: plan?.currency || 'NGN',
      reference: payment.reference,
    });
  },

  async createOrExtendSubscription(payment: any, t?: Transaction): Promise<void> {
    await Subscription.upsert(
      {
        user_id: payment.user_id,
        estate_id: payment.estate_id,
        status: 'active',
        start_date: new Date(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      { transaction: t },
    );
  },
};
