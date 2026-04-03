import cron from 'node-cron';
import { Op } from 'sequelize';
import { Subscription } from '../../modules/payment/models/subscription.model';
import { User } from '../../modules/auth/models/user.model';
import { brevoEmailService } from '../../modules/communication/services/brevo.email.service';
import { pushNotificationService } from '../../modules/communication/services/push-notification.service';
import smsService from '../../modules/communication/services/sms.service';
import logger from '../utils/logger';

const GRACE_PERIOD_DAYS = 7;
// Minimum hours between reminder notifications for the same subscription
const REMINDER_INTERVAL_HOURS = 48;

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

interface EstateManager {
  id: string;
  email: string;
  phone: string;
  first_name: string;
}

async function getEstateManager(estateId: string): Promise<EstateManager | null> {
  try {
    const manager = await User.findOne({
      where: { estate_id: estateId, user_type: 'manager' },
    });
    if (!manager) return null;
    return { id: manager.id, email: manager.email, phone: manager.phone, first_name: manager.first_name };
  } catch {
    return null;
  }
}

async function shouldSendReminder(subscription: Subscription): Promise<boolean> {
  if (!subscription.last_notification_sent) return true;
  const hoursSinceLast =
    (Date.now() - subscription.last_notification_sent.getTime()) / (1000 * 60 * 60);
  return hoursSinceLast >= REMINDER_INTERVAL_HOURS;
}

async function sendSubscriptionNotification(
  subscription: Subscription,
  subject: string,
  pushTitle: string,
  pushBody: string,
  html: string,
  text: string,
) {
  const manager = await getEstateManager(subscription.estate_id);
  if (!manager) return;

  await Promise.allSettled([
    brevoEmailService.sendEmail({ to: manager.email, subject, htmlContent: html, textContent: text }),
    pushNotificationService.sendToUser(manager.id, pushTitle, pushBody, { type: 'subscription_reminder' }),
    smsService.sendNotification(manager.phone, pushTitle, text),
  ]);

  await subscription.update({ last_notification_sent: new Date() });
}

export const startSubscriptionExpiryJob = () => {
  // Run daily at 06:00 WAT (UTC+1 = 05:00 UTC)
  cron.schedule('0 5 * * *', async () => {
    try {
      const now = new Date();

      // 0. Active subscriptions expiring within 3 days — send advance renewal reminder
      const in3Days = addDays(now, 3);
      const preExpiryReminders = await Subscription.findAll({
        where: {
          status: 'active',
          end_date: { [Op.between]: [now, in3Days] },
        },
      });

      for (const sub of preExpiryReminders) {
        if (!(await shouldSendReminder(sub))) continue;
        const daysLeft = Math.ceil((sub.end_date.getTime() - now.getTime()) / 86400000);
        const subject = `Lockwise: Your subscription expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`;
        const pushTitle = `Subscription Expiring Soon`;
        const pushBody = `Your Lockwise subscription expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}. Renew now to stay uninterrupted.`;
        const renewUrl = `${process.env.WEB_PORTAL_URL}/subscribe`;
        const html = `
          <h2>Subscription Expiring Soon</h2>
          <p>Your Lockwise subscription expires in <strong>${daysLeft} day${daysLeft !== 1 ? 's' : ''}</strong>.
          Renew now to avoid any interruption to your estate access management.</p>
          <p><a href="${renewUrl}" style="background:#4F46E5;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">Renew Now</a></p>
        `;
        const text = `Your Lockwise subscription expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}. Renew now: ${renewUrl}`;
        await sendSubscriptionNotification(sub, subject, pushTitle, pushBody, html, text).catch((e) =>
          logger.error('Pre-expiry reminder notification error:', e),
        );
      }

      // 1. Active subscriptions whose end_date has passed → enter grace period
      const activeExpired = await Subscription.findAll({
        where: { status: 'active', end_date: { [Op.lt]: now } },
      });

      for (const sub of activeExpired) {
        const gracePeriodEnd = addDays(sub.end_date, GRACE_PERIOD_DAYS);
        await sub.update({ status: 'grace_period', grace_period_end_date: gracePeriodEnd });

        const daysLeft = GRACE_PERIOD_DAYS;
        const subject = 'Your Lockwise Subscription Has Expired — Grace Period Active';
        const pushTitle = 'Subscription Expired';
        const pushBody = `You have ${daysLeft} days to renew before losing access management features.`;
        const renewUrl = `${process.env.WEB_PORTAL_URL}/subscribe`;
        const html = `
          <h2>Subscription Expired</h2>
          <p>Your Lockwise subscription has expired. You have <strong>${daysLeft} days</strong> to renew
          before your estate loses access management features.</p>
          <p><a href="${renewUrl}" style="background:#4F46E5;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">Renew Now</a></p>
        `;
        const text = `Your Lockwise subscription expired. Renew within ${daysLeft} days: ${renewUrl}`;
        await sendSubscriptionNotification(sub, subject, pushTitle, pushBody, html, text).catch((e) =>
          logger.error('Grace period notification error:', e),
        );

        logger.info(`Subscription ${sub.id} entered grace period (ends ${gracePeriodEnd.toISOString()})`);
      }

      // 2. Grace period subscriptions whose grace_period_end_date has passed → expired
      const graceExpired = await Subscription.findAll({
        where: {
          status: 'grace_period',
          grace_period_end_date: { [Op.lt]: now },
        },
      });

      for (const sub of graceExpired) {
        await sub.update({ status: 'expired' });

        const subject = 'Lockwise Subscription Expired — Renewal Required';
        const pushTitle = 'Grace Period Ended';
        const pushBody = 'Your subscription grace period has ended. Renew now to restore full access management.';
        const renewUrl = `${process.env.WEB_PORTAL_URL}/subscribe`;
        const html = `
          <h2>Subscription Fully Expired</h2>
          <p>Your Lockwise subscription grace period has ended. Please renew your subscription
          to continue managing your estate seamlessly.</p>
          <p><a href="${renewUrl}" style="background:#DC2626;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">Renew Subscription</a></p>
        `;
        const text = `Your Lockwise subscription grace period has ended. Renew now: ${renewUrl}`;
        await sendSubscriptionNotification(sub, subject, pushTitle, pushBody, html, text).catch((e) =>
          logger.error('Expiry notification error:', e),
        );

        logger.info(`Subscription ${sub.id} fully expired`);
      }

      // 3. Subscriptions still in grace_period — send periodic reminders
      const inGrace = await Subscription.findAll({
        where: {
          status: 'grace_period',
          grace_period_end_date: { [Op.gte]: now },
        },
      });

      for (const sub of inGrace) {
        if (!(await shouldSendReminder(sub))) continue;
        const daysLeft = Math.ceil(
          (sub.grace_period_end_date!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        );
        const subject = `Lockwise: ${daysLeft} Day${daysLeft !== 1 ? 's' : ''} Left to Renew`;
        const pushTitle = `${daysLeft} Day${daysLeft !== 1 ? 's' : ''} Left to Renew`;
        const pushBody = `Renew your Lockwise subscription now to avoid service interruption.`;
        const renewUrl = `${process.env.WEB_PORTAL_URL}/subscribe`;
        const html = `
          <h2>Subscription Reminder</h2>
          <p>You have <strong>${daysLeft} day${daysLeft !== 1 ? 's' : ''}</strong> remaining in your
          grace period. Renew now to avoid any service interruption.</p>
          <p><a href="${renewUrl}" style="background:#F59E0B;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">Renew Now</a></p>
        `;
        const text = `${daysLeft} days left to renew your Lockwise subscription: ${renewUrl}`;
        await sendSubscriptionNotification(sub, subject, pushTitle, pushBody, html, text).catch((e) =>
          logger.error('Grace reminder notification error:', e),
        );
      }

      // 4. Already expired subscriptions — periodic nag reminders
      const expired = await Subscription.findAll({
        where: { status: 'expired' },
      });

      for (const sub of expired) {
        if (!(await shouldSendReminder(sub))) continue;
        const subject = 'Action Required: Renew Your Lockwise Subscription';
        const pushTitle = 'Subscription Renewal Required';
        const pushBody = 'Your Lockwise subscription is expired. Renew to restore full estate management.';
        const renewUrl = `${process.env.WEB_PORTAL_URL}/subscribe`;
        const html = `
          <h2>Subscription Renewal Required</h2>
          <p>Your Lockwise subscription is expired. Renew now to continue using all
          estate management features without interruption.</p>
          <p><a href="${renewUrl}" style="background:#DC2626;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">Renew Subscription</a></p>
        `;
        const text = `Your Lockwise subscription is expired. Renew now: ${renewUrl}`;
        await sendSubscriptionNotification(sub, subject, pushTitle, pushBody, html, text).catch((e) =>
          logger.error('Expired reminder notification error:', e),
        );
      }

      logger.info(
        `Subscription job: ${preExpiryReminders.length} pre-expiry reminders, ${activeExpired.length} entered grace, ${graceExpired.length} fully expired, ${inGrace.length} in grace, ${expired.length} expired reminders`,
      );
    } catch (error) {
      logger.error('Subscription expiry job error:', error);
    }
  });

  logger.info('Subscription expiry job started');
};
