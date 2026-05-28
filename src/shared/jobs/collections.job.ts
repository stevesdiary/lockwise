import cron from 'node-cron';
import { collectionsService } from '../../modules/collections/services/collections.service';
import logger from '../utils/logger';

export const startCollectionsCronJobs = () => {
  // Daily at 1:00 AM — mark overdue invoices
  cron.schedule('0 1 * * *', async () => {
    try {
      const overdue = await collectionsService.markOverdueInvoices();
      if (overdue > 0) logger.info(`[collections] Marked ${overdue} invoices as overdue`);
    } catch (error) {
      logger.error('[collections] Overdue job error:', error);
    }
  });

  // Daily at 2:00 AM — apply penalties after grace period
  cron.schedule('0 2 * * *', async () => {
    try {
      const applied = await collectionsService.applyPenalties();
      if (applied > 0) logger.info(`[collections] Applied penalties to ${applied} invoices`);
    } catch (error) {
      logger.error('[collections] Penalty job error:', error);
    }
  });

  logger.info('[collections] Cron jobs started (overdue @ 1AM, penalties @ 2AM)');
};
