import cron from 'node-cron';
import { QueryTypes } from 'sequelize';
import sequelize from '../core/database';
import pushNotificationService from '../../modules/communication/services/push.notification.service';
import { getFromRedis, saveToRedis } from '../core/redis';
import logger from '../utils/logger';

const REDIS_LAST_TYPE_KEY = 'safety_notification:last_type';
const REDIS_LAST_SENT_KEY = 'safety_notification:last_sent';

// Interval in days between safety notifications (14 = every 2 weeks, 21 = every 3 weeks)
const INTERVAL_DAYS = parseInt(process.env.SAFETY_NOTIFICATION_INTERVAL_DAYS || '14', 10);

const SAFETY_TYPES = ['medical', 'fire', 'burglary', 'flood', 'power_outage'] as const;
type SafetyType = typeof SAFETY_TYPES[number];

const SAFETY_MESSAGES: Record<SafetyType, { title: string; message: string }> = {
  medical: {
    title: '🏥 Monthly Safety Tip: Medical',
    message: 'Keep your emergency medical kit stocked and accessible. Know your nearest hospital route and have emergency contacts saved.',
  },
  fire: {
    title: '🔥 Monthly Safety Tip: Fire',
    message: 'Check your smoke detectors, keep fire exits clear, and review your estate\'s evacuation route with your household.',
  },
  burglary: {
    title: '🔒 Monthly Safety Tip: Security',
    message: 'Ensure doors and windows are locked when you leave. Report any suspicious activity to estate security immediately.',
  },
  flood: {
    title: '🌊 Monthly Safety Tip: Flood',
    message: 'Keep drains and gutters clear. Know your estate\'s flood response plan and store important documents in a waterproof location.',
  },
  power_outage: {
    title: '⚡ Monthly Safety Tip: Power',
    message: 'Keep torches and backup power sources ready. Unplug sensitive equipment during outages and report prolonged outages to your estate manager.',
  },
};

function getNextSafetyType(lastType: SafetyType | null): SafetyType {
  if (!lastType) return SAFETY_TYPES[0];
  const currentIndex = SAFETY_TYPES.indexOf(lastType);
  return SAFETY_TYPES[(currentIndex + 1) % SAFETY_TYPES.length];
}

async function sendSafetyNotifications() {
  try {
    const lastSentStr = await getFromRedis<string>(REDIS_LAST_SENT_KEY);
    if (lastSentStr) {
      const lastSent = new Date(lastSentStr);
      const daysSinceLastSent = (Date.now() - lastSent.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceLastSent < INTERVAL_DAYS) {
        logger.info(`Safety notification skipped — last sent ${Math.floor(daysSinceLastSent)} days ago (interval: ${INTERVAL_DAYS} days)`);
        return;
      }
    }

    const lastType = await getFromRedis<SafetyType>(REDIS_LAST_TYPE_KEY);
    const nextType = getNextSafetyType(lastType);
    const { title, message } = SAFETY_MESSAGES[nextType];

    // Get all distinct active estate IDs
    const estates = await sequelize.query<{ id: string }>(
      `SELECT DISTINCT e.id FROM estates e
       INNER JOIN users u ON u.estate_id = e.id AND u.status = 'active'`,
      { type: QueryTypes.SELECT }
    );

    let totalSent = 0;
    for (const estate of estates) {
      try {
        const notifications = await pushNotificationService.sendToEstate(estate.id, {
          title,
          message,
          type: 'system_alert',
          data: { safety_type: nextType, category: 'periodic_safety' },
        });
        totalSent += notifications.length;
      } catch (err) {
        logger.error(`Safety notification failed for estate ${estate.id}:`, err);
      }
    }

    // Persist state — TTL of 60 days is well beyond any reasonable interval
    const now = new Date().toISOString();
    await saveToRedis(REDIS_LAST_TYPE_KEY, nextType, 60 * 24 * 60 * 60);
    await saveToRedis(REDIS_LAST_SENT_KEY, now, 60 * 24 * 60 * 60);

    logger.info(`Safety notification (${nextType}) sent to ${totalSent} users across ${estates.length} estates`);
  } catch (error) {
    logger.error('Safety notification job error:', error);
  }
}

export const startSafetyNotificationJob = () => {
  // Run every Monday at 9:00 AM; the handler checks whether the interval has elapsed
  cron.schedule('0 9 * * 1', sendSafetyNotifications);
  logger.info('Safety notification job started');
};
