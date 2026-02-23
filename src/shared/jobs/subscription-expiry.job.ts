import cron from 'node-cron';
import subscriptionService from '../../modules/payment/services/subscription.service';
import logger from '../utils/logger';

export const startSubscriptionExpiryJob = () => {
  // Run subscription expiry job every two days to mark overdue active subscriptions as expired.
  cron.schedule('0 0 */2 * *', async () => {
    try {
      const expiredCount = await subscriptionService.checkExpiredSubscriptions();
      if (expiredCount > 0) {
        logger.info(`Expired ${expiredCount} subscriptions`);
      }
    } catch (error) {
      logger.error('Subscription expiry job error:', error);
    }
  });

  logger.info('Subscription expiry job started');
};
