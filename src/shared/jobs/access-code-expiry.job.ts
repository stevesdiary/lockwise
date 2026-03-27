import cron from 'node-cron';
import AccessLog from '../../modules/access/models/access-log.model';
import { Op } from 'sequelize';
import logger from '../utils/logger';

export const startAccessCodeExpiryJob = () => {
  // Run every 10 minutes
  cron.schedule('*/10 * * * *', async () => {
    try {
      const result = await AccessLog.update(
        { status: 'expired' },
        {
          where: {
            status: 'active',
            valid_until: {
              [Op.lt]: new Date()
            }
          }
        }
      );

      if (result[0] > 0) {
        logger.info(`Expired ${result[0]} access codes`);
      }
    } catch (error) {
      logger.error('Access code expiry job error:', error);
    }
  });

  logger.info('Access code expiry job started');
};
