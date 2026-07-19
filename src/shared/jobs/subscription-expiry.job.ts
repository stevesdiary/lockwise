import cron from 'node-cron';
import { Op } from 'sequelize';
import { Subscription } from '../../modules/payment/models/subscription.model';
import { User } from '../../modules/auth/models/user.model';
import { brevoEmailService } from '../../modules/communication/services/brevo.email.service';
import pushNotificationService from '../../modules/communication/services/push.notification.service';
import smsService from '../../modules/communication/services/sms.service';
import subscriptionEventService from '../../modules/payment/services/subscription-event.service';
import logger from '../utils/logger';

const GRACE_PERIOD_DAYS = 7;
const TRIAL_DAYS = 30;
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

      // ========== TRIAL STATE HANDLING ==========

      // 0a. Trial subscriptions expiring in 7 days (day 23) — send first reminder
      const in7Days = addDays(now, 7);
      const trialReminders7Days = await Subscription.findAll({
        where: {
          subscription_state: 'TRIAL',
          trial_end_date: { [Op.between]: [in7Days, addDays(in7Days, 1)] },
        },
      });

      for (const sub of trialReminders7Days) {
        if (!(await shouldSendReminder(sub))) continue;
        const subject = 'Lockwise: Your Trial Expires in 7 Days';
        const pushTitle = 'Trial Expiring Soon';
        const pushBody = 'Your 30-day trial expires in 7 days. Select a plan to avoid service interruption.';
        const selectPlanUrl = `${process.env.WEB_PORTAL_URL}/portal/payment`;
        const html = `
          <h2>Trial Expiring Soon</h2>
          <p>Your Lockwise 30-day trial expires in <strong>7 days</strong>.</p>
          <p>Select a plan now to continue enjoying uninterrupted estate management.</p>
          <p><a href="${selectPlanUrl}" style="background:#4F46E5;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">Select a Plan</a></p>
        `;
        const text = `Your Lockwise trial expires in 7 days. Select a plan: ${selectPlanUrl}`;
        await sendSubscriptionNotification(sub, subject, pushTitle, pushBody, html, text).catch((e) =>
          logger.error('Trial 7-day reminder error:', e),
        );

        await subscriptionEventService.logEvent({
          subscriptionId: sub.id,
          estateId: sub.estate_id,
          eventType: 'trial_ending_soon',
          previousState: 'TRIAL',
          newState: 'TRIAL',
          triggerReason: 'Trial expires in 7 days',
        });
      }

      // 0b. Trial subscriptions expiring in 3 days (day 27) — send urgent reminder with SMS
      const in3Days = addDays(now, 3);
      const trialReminders3Days = await Subscription.findAll({
        where: {
          subscription_state: 'TRIAL',
          trial_end_date: { [Op.between]: [in3Days, addDays(in3Days, 1)] },
        },
      });

      for (const sub of trialReminders3Days) {
        const manager = await getEstateManager(sub.estate_id);
        if (!manager) continue;

        const subject = 'URGENT: Lockwise Trial Expires in 3 Days';
        const pushTitle = 'Trial Expiring in 3 Days';
        const pushBody = 'Your trial expires in 3 days. Select a plan now to avoid service interruption.';
        const selectPlanUrl = `${process.env.WEB_PORTAL_URL}/portal/payment`;
        const html = `
          <h2 style="color:#DC2626">URGENT: Trial Expiring Soon</h2>
          <p>Your Lockwise 30-day trial expires in <strong>3 days</strong>.</p>
          <p>Select a plan immediately to avoid losing access to estate management features.</p>
          <p><a href="${selectPlanUrl}" style="background:#DC2626;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">Select a Plan Now</a></p>
        `;
        const text = `URGENT: Your Lockwise trial expires in 3 days. Select a plan now: ${selectPlanUrl}`;

        // Send email, push, AND SMS
        await Promise.allSettled([
          brevoEmailService.sendEmail({ to: manager.email, subject, htmlContent: html, textContent: text }),
          pushNotificationService.sendToUser(manager.id, pushTitle, pushBody, { type: 'trial_urgent' }),
          smsService.sendNotification(manager.phone, pushTitle, text),
        ]);

        await sub.update({ last_notification_sent: new Date() });

        await subscriptionEventService.logEvent({
          subscriptionId: sub.id,
          estateId: sub.estate_id,
          eventType: 'trial_ending_soon',
          previousState: 'TRIAL',
          newState: 'TRIAL',
          triggerReason: 'Trial expires in 3 days (urgent)',
        });
      }

      // 0c. Trial subscriptions that have expired → transition to GRACE
      const trialExpired = await Subscription.findAll({
        where: {
          subscription_state: 'TRIAL',
          trial_end_date: { [Op.lt]: now },
        },
      });

      for (const sub of trialExpired) {
        const gracePeriodEnd = addDays(now, GRACE_PERIOD_DAYS);
        await sub.update({
          subscription_state: 'GRACE',
          status: 'grace_period',
          grace_period_end_date: gracePeriodEnd,
        });

        const subject = 'Lockwise Trial Ended — Grace Period Active';
        const pushTitle = 'Trial Ended';
        const pushBody = `Your trial has ended. You have ${GRACE_PERIOD_DAYS} days to select a plan.`;
        const selectPlanUrl = `${process.env.WEB_PORTAL_URL}/portal/payment`;
        const html = `
          <h2>Trial Period Ended</h2>
          <p>Your Lockwise 30-day trial has ended. You now have <strong>${GRACE_PERIOD_DAYS} days</strong> of grace period.</p>
          <p><strong>Features now restricted:</strong></p>
          <ul>
            <li>Visitor management - disabled</li>
            <li>Domestic staff management - disabled</li>
            <li>Reporting and analytics - disabled</li>
            <li>Issue tracking - disabled</li>
          </ul>
          <p>Select a plan now to restore full access.</p>
          <p><a href="${selectPlanUrl}" style="background:#F59E0B;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">Select a Plan</a></p>
        `;
        const text = `Your Lockwise trial ended. Grace period: ${GRACE_PERIOD_DAYS} days. Select a plan: ${selectPlanUrl}`;
        await sendSubscriptionNotification(sub, subject, pushTitle, pushBody, html, text).catch((e) =>
          logger.error('Trial ended notification error:', e),
        );

        await subscriptionEventService.logEvent({
          subscriptionId: sub.id,
          estateId: sub.estate_id,
          eventType: 'trial_ended',
          previousState: 'TRIAL',
          newState: 'GRACE',
          triggerReason: 'Trial period expired',
          metadata: { grace_period_end_date: gracePeriodEnd.toISOString() },
        });

        await subscriptionEventService.logEvent({
          subscriptionId: sub.id,
          estateId: sub.estate_id,
          eventType: 'grace_period_started',
          previousState: 'TRIAL',
          newState: 'GRACE',
          triggerReason: 'Trial expired without plan selection',
        });

        logger.info(`Subscription ${sub.id} transitioned from TRIAL to GRACE (ends ${gracePeriodEnd.toISOString()})`);
      }

      // ========== ACTIVE STATE HANDLING ==========

      // 0d. Active subscriptions expiring within 3 days — send advance renewal reminder
      const activePreExpiryReminders = await Subscription.findAll({
        where: {
          subscription_state: 'ACTIVE',
          end_date: { [Op.between]: [now, in3Days] },
        },
      });

      for (const sub of activePreExpiryReminders) {
        if (!(await shouldSendReminder(sub))) continue;
        const daysLeft = Math.ceil((sub.end_date.getTime() - now.getTime()) / 86400000);
        const subject = `Lockwise: Your subscription expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`;
        const pushTitle = `Subscription Expiring Soon`;
        const pushBody = `Your Lockwise subscription expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}. Renew now to stay uninterrupted.`;
        const renewUrl = `${process.env.WEB_PORTAL_URL}/portal/payment`;
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
        where: {
          subscription_state: 'ACTIVE',
          end_date: { [Op.lt]: now },
        },
      });

      for (const sub of activeExpired) {
        const gracePeriodEnd = addDays(sub.end_date, GRACE_PERIOD_DAYS);
        await sub.update({
          subscription_state: 'GRACE',
          status: 'grace_period',
          grace_period_end_date: gracePeriodEnd,
        });

        const daysLeft = GRACE_PERIOD_DAYS;
        const subject = 'Your Lockwise Subscription Has Expired — Grace Period Active';
        const pushTitle = 'Subscription Expired';
        const pushBody = `You have ${daysLeft} days to renew before losing access management features.`;
        const renewUrl = `${process.env.WEB_PORTAL_URL}/portal/payment`;
        const html = `
          <h2>Subscription Expired</h2>
          <p>Your Lockwise subscription has expired. You have <strong>${daysLeft} days</strong> to renew
          before your estate loses access management features.</p>
          <p><strong>Features now restricted:</strong></p>
          <ul>
            <li>Visitor management - disabled</li>
            <li>Domestic staff management - disabled</li>
            <li>Reporting and analytics - disabled</li>
            <li>Issue tracking - disabled</li>
          </ul>
          <p><a href="${renewUrl}" style="background:#4F46E5;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">Renew Now</a></p>
        `;
        const text = `Your Lockwise subscription expired. Renew within ${daysLeft} days: ${renewUrl}`;
        await sendSubscriptionNotification(sub, subject, pushTitle, pushBody, html, text).catch((e) =>
          logger.error('Grace period notification error:', e),
        );

        await subscriptionEventService.logEvent({
          subscriptionId: sub.id,
          estateId: sub.estate_id,
          eventType: 'grace_period_started',
          previousState: 'ACTIVE',
          newState: 'GRACE',
          triggerReason: 'Subscription expired without renewal',
          metadata: { grace_period_end_date: gracePeriodEnd.toISOString() },
        });

        logger.info(`Subscription ${sub.id} entered grace period (ends ${gracePeriodEnd.toISOString()})`);
      }

      // ========== GRACE STATE HANDLING ==========

      // 2. Grace period subscriptions whose grace_period_end_date has passed → LAPSED
      const graceExpired = await Subscription.findAll({
        where: {
          subscription_state: 'GRACE',
          grace_period_end_date: { [Op.lt]: now },
        },
      });

      for (const sub of graceExpired) {
        await sub.update({
          subscription_state: 'LAPSED',
          status: 'expired',
          lapsed_start_date: now,
        });

        const subject = 'Lockwise Subscription Lapsed — Immediate Action Required';
        const pushTitle = 'Grace Period Ended';
        const pushBody = 'Your subscription grace period has ended. Features will degrade over the next 30 days.';
        const renewUrl = `${process.env.WEB_PORTAL_URL}/portal/payment`;
        const html = `
          <h2>Subscription Lapsed</h2>
          <p>Your Lockwise subscription grace period has ended.</p>
          <p><strong>What happens next:</strong></p>
          <ul>
            <li>Days 1-7: Full access continues</li>
            <li>Days 8-14: Reporting and analytics disabled</li>
            <li>Days 15-21: Visitor management disabled</li>
            <li>Days 22-30: Manager portal becomes read-only</li>
            <li>Day 31+: Manager portal locked</li>
          </ul>
          <p>Renew now to avoid service degradation.</p>
          <p><a href="${renewUrl}" style="background:#DC2626;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">Renew Subscription</a></p>
        `;
        const text = `Your Lockwise subscription grace period has ended. Renew now: ${renewUrl}`;
        await sendSubscriptionNotification(sub, subject, pushTitle, pushBody, html, text).catch((e) =>
          logger.error('Lapsed notification error:', e),
        );

        await subscriptionEventService.logEvent({
          subscriptionId: sub.id,
          estateId: sub.estate_id,
          eventType: 'grace_period_ended',
          previousState: 'GRACE',
          newState: 'LAPSED',
          triggerReason: 'Grace period expired without payment',
        });

        await subscriptionEventService.logEvent({
          subscriptionId: sub.id,
          estateId: sub.estate_id,
          eventType: 'subscription_lapsed',
          previousState: 'GRACE',
          newState: 'LAPSED',
          triggerReason: 'Grace period expired',
          metadata: { lapsed_start_date: now.toISOString() },
        });

        logger.info(`Subscription ${sub.id} transitioned to LAPSED state`);
      }

      // 3. Subscriptions still in grace_period — send periodic reminders
      const inGrace = await Subscription.findAll({
        where: {
          subscription_state: 'GRACE',
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
        const renewUrl = `${process.env.WEB_PORTAL_URL}/portal/payment`;
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

        await subscriptionEventService.logEvent({
          subscriptionId: sub.id,
          estateId: sub.estate_id,
          eventType: 'grace_period_ending',
          previousState: 'GRACE',
          newState: 'GRACE',
          triggerReason: `Grace period reminder: ${daysLeft} days remaining`,
        });
      }

      // ========== LAPSED STATE HANDLING ==========

      // 4. Lapsed subscriptions — periodic reminders with degradation warnings
      const lapsed = await Subscription.findAll({
        where: { subscription_state: 'LAPSED' },
      });

      for (const sub of lapsed) {
        if (!(await shouldSendReminder(sub))) continue;
        
        const daysSinceLapsed = Math.floor(
          (now.getTime() - (sub.lapsed_start_date?.getTime() || now.getTime())) / (1000 * 60 * 60 * 24)
        );

        let subject = 'Action Required: Renew Your Lockwise Subscription';
        let pushTitle = 'Subscription Renewal Required';
        let pushBody = 'Your Lockwise subscription is lapsed. Renew to restore full estate management.';
        let html = '';

        if (daysSinceLapsed <= 7) {
          subject = 'Lockwise: Subscription Lapsed — Full Access Still Available';
          pushTitle = 'Subscription Lapsed';
          pushBody = 'Your subscription has lapsed. Renew now before features start degrading.';
          html = `
            <h2>Subscription Lapsed</h2>
            <p>Your Lockwise subscription has lapsed. You currently still have full access.</p>
            <p><strong>Upcoming restrictions:</strong></p>
            <ul>
              <li>Day 8: Reporting and analytics will be disabled</li>
              <li>Day 15: Visitor management will be disabled</li>
              <li>Day 22: Manager portal becomes read-only</li>
              <li>Day 31: Manager portal will be locked</li>
            </ul>
            <p>Renew now to avoid these restrictions.</p>
            <p><a href="${process.env.WEB_PORTAL_URL}/portal/payment" style="background:#DC2626;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">Renew Subscription</a></p>
          `;
        } else if (daysSinceLapsed <= 14) {
          subject = 'Lockwise: Reporting Disabled — Renew Now';
          pushTitle = 'Features Restricted';
          pushBody = 'Reporting and analytics are now disabled. Renew to restore access.';
          html = `
            <h2>Features Restricted</h2>
            <p>Your subscription has been lapsed for ${daysSinceLapsed} days.</p>
            <p><strong>Currently disabled:</strong> Reporting and analytics</p>
            <p><strong>Upcoming restrictions:</strong></p>
            <ul>
              <li>Day 15: Visitor management will be disabled</li>
              <li>Day 22: Manager portal becomes read-only</li>
              <li>Day 31: Manager portal will be locked</li>
            </ul>
            <p><a href="${process.env.WEB_PORTAL_URL}/portal/payment" style="background:#DC2626;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">Renew Subscription</a></p>
          `;
        } else if (daysSinceLapsed <= 21) {
          subject = 'Lockwise: Visitor Management Disabled — Urgent Action Required';
          pushTitle = 'Critical: Features Restricted';
          pushBody = 'Visitor management is now disabled. Renew immediately.';
          html = `
            <h2>Critical: Features Restricted</h2>
            <p>Your subscription has been lapsed for ${daysSinceLapsed} days.</p>
            <p><strong>Currently disabled:</strong> Reporting, analytics, visitor management, new staff registrations</p>
            <p><strong>Upcoming restrictions:</strong></p>
            <ul>
              <li>Day 22: Manager portal becomes read-only</li>
              <li>Day 31: Manager portal will be locked</li>
            </ul>
            <p><a href="${process.env.WEB_PORTAL_URL}/portal/payment" style="background:#DC2626;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">Renew Subscription</a></p>
          `;
        } else if (daysSinceLapsed <= 30) {
          subject = 'Lockwise: Manager Portal Read-Only — Immediate Renewal Required';
          pushTitle = 'Portal Read-Only';
          pushBody = 'Manager portal is now read-only. Renew immediately to restore access.';
          html = `
            <h2>Manager Portal Read-Only</h2>
            <p>Your subscription has been lapsed for ${daysSinceLapsed} days.</p>
            <p><strong>Manager portal is now read-only.</strong> You can view data but cannot make changes.</p>
            <p>In ${31 - daysSinceLapsed} day${31 - daysSinceLapsed !== 1 ? 's' : ''}, the manager portal will be completely locked.</p>
            <p><a href="${process.env.WEB_PORTAL_URL}/portal/payment" style="background:#DC2626;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">Renew Subscription Now</a></p>
          `;
        } else {
          subject = 'Lockwise: Manager Portal Locked — Subscription Suspended';
          pushTitle = 'Portal Locked';
          pushBody = 'Manager portal access is locked. Renew your subscription to restore access.';
          html = `
            <h2>Manager Portal Locked</h2>
            <p>Your subscription has been lapsed for ${daysSinceLapsed} days.</p>
            <p><strong>Manager portal access is now locked.</strong></p>
            <p>Resident app still works for basic access and emergency contacts only.</p>
            <p>Renew your subscription immediately to restore full estate management.</p>
            <p><a href="${process.env.WEB_PORTAL_URL}/portal/payment" style="background:#DC2626;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">Renew Subscription</a></p>
          `;
        }

        const text = `${pushBody} Renew: ${process.env.WEB_PORTAL_URL}/portal/payment`;
        await sendSubscriptionNotification(sub, subject, pushTitle, pushBody, html, text).catch((e) =>
          logger.error('Lapsed reminder notification error:', e),
        );

        await subscriptionEventService.logEvent({
          subscriptionId: sub.id,
          estateId: sub.estate_id,
          eventType: 'subscription_suspended',
          previousState: 'LAPSED',
          newState: 'LAPSED',
          triggerReason: `Lapsed reminder: ${daysSinceLapsed} days since lapsed`,
          metadata: { days_since_lapsed: daysSinceLapsed },
        });
      }

      logger.info(
        `Subscription job: ${trialReminders7Days.length} trial 7-day, ${trialReminders3Days.length} trial 3-day, ${trialExpired.length} trial expired, ${activePreExpiryReminders.length} active pre-expiry, ${activeExpired.length} entered grace, ${graceExpired.length} entered lapsed, ${inGrace.length} in grace, ${lapsed.length} lapsed reminders`,
      );
    } catch (error) {
      logger.error('Subscription expiry job error:', error);
    }
  });

  logger.info('Subscription expiry job started');
};
