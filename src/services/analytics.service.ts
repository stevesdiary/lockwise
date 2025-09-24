import { Payment } from '../models/payment.model';
import { User } from '../models/user.model';
import { Estate } from '../models/estate.model';
import { Subscription } from '../models/subscription.model';
import { Op } from 'sequelize';

export const analyticsService = {
  getRevenueAnalytics: async (period: 'week' | 'month' | 'year' = 'month') => {
    const startDate = new Date();
    if (period === 'week') startDate.setDate(startDate.getDate() - 7);
    else if (period === 'month') startDate.setMonth(startDate.getMonth() - 1);
    else startDate.setFullYear(startDate.getFullYear() - 1);

    const payments = await Payment.findAll({
      where: {
        payment_status: 'completed',
        createdAt: { [Op.gte]: startDate }
      },
      attributes: ['amount', 'createdAt', 'currency']
    });

    const totalRevenue = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
    const paymentCount = payments.length;

    return {
      totalRevenue,
      paymentCount,
      period,
      payments: payments.slice(0, 10) // Latest 10 payments
    };
  },

  getSystemStats: async () => {
    const [totalUsers, totalEstates, activeSubscriptions, totalRevenue] = await Promise.all([
      User.count(),
      Estate.count(),
      Subscription.count({ where: { status: 'active' }}),
      Payment.sum('amount', { where: { payment_status: 'completed' }})
    ]);

    return {
      totalUsers,
      totalEstates,
      activeSubscriptions,
      totalRevenue: totalRevenue || 0
    };
  }
};