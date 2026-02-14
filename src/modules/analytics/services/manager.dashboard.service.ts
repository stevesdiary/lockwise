import { Payment } from '../../payment/models/payment.model';
import { User } from '../../auth/models/user.model';
import { Subscription } from '../../payment/models/subscription.model';
import accessLogService from '../../access/services/access-log.service';

export const managerDashboardService = {
  getEstateOverview: async (estate_id: string) => {
    const [totalResidents, totalPayments, totalRevenue, activeSubscriptions] = await Promise.all([
      User.count({ where: { estate_id }}),
      Payment.count({ where: { estate_id }}),
      Payment.sum('amount', { where: { estate_id, payment_status: 'completed' }}),
      Subscription.count({ where: { estate_id, status: 'active' }})
    ]);

    return {
      totalResidents,
      totalPayments,
      totalRevenue: totalRevenue || 0,
      activeSubscriptions
    };
  },

  getEstateResidents: async (estate_id: string, filters: { limit?: number; offset?: number }) => {
    return await User.findAll({
      where: { estate_id },
      include: [
        { 
          model: Subscription, 
          where: { estate_id },
          required: false,
          attributes: ['status', 'start_date', 'end_date']
        }
      ],
      limit: filters.limit || 50,
      offset: filters.offset || 0,
      order: [['createdAt', 'DESC']]
    });
  },

  getEstateAccessLogs: async (estate_id: string, filters: { limit?: number; offset?: number }) => {
    return await accessLogService.getAccessLogs({
      estate_id,
      limit: filters.limit || 100,
      offset: filters.offset || 0
    });
  },

  getEstatePayments: async (estate_id: string, filters: { limit?: number; offset?: number; status?: string }) => {
    return await Payment.findAll({
      where: {
        estate_id,
        ...(filters.status && { payment_status: filters.status })
      },
      include: [
        { model: User, attributes: ['first_name', 'last_name', 'email'] }
      ],
      limit: filters.limit || 50,
      offset: filters.offset || 0,
      order: [['createdAt', 'DESC']]
    });
  }
};