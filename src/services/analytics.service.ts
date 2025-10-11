import { Payment } from '../models/payment.model';
import { User } from '../models/user.model';
import { Estate } from '../models/estate.model';
import { Subscription } from '../models/subscription.model';
import { AccessLog } from '../models/access.log.model';
import { Op, fn, col, literal } from 'sequelize';

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
  },

  getDetailedAnalytics: async () => {
    const [estateStats, userStats, revenueStats, accessStats] = await Promise.all([
      // Estate statistics
      Estate.findAll({
        attributes: [
          'estate_id',
          'name',
          'city',
          'state',
          'status',
          [fn('COUNT', col('users.user_id')), 'resident_count']
        ],
        include: [{
          model: User,
          as: 'users',
          where: { role: 'resident' },
          attributes: [],
          required: false
        }],
        group: ['Estate.estate_id'],
        raw: true
      }),

      // User role distribution
      User.findAll({
        attributes: [
          'role',
          [fn('COUNT', col('user_id')), 'count']
        ],
        group: ['role'],
        raw: true
      }),

      // Revenue by month (last 12 months)
      Payment.findAll({
        attributes: [
          [fn('DATE_TRUNC', 'month', col('created_at')), 'month'],
          [fn('SUM', col('amount')), 'revenue'],
          [fn('COUNT', col('payment_id')), 'payment_count']
        ],
        where: {
          payment_status: 'completed',
          created_at: {
            [Op.gte]: literal("NOW() - INTERVAL '12 months'")
          }
        },
        group: [fn('DATE_TRUNC', 'month', col('created_at'))],
        order: [[fn('DATE_TRUNC', 'month', col('created_at')), 'ASC']],
        raw: true
      }),

      // Access statistics
      AccessLog.findAll({
        attributes: [
          'access_type',
          [fn('COUNT', col('id')), 'count']
        ],
        group: ['access_type'],
        raw: true
      })
    ]);

    // Calculate totals
    const totalEstates = estateStats.length;
    const totalResidents = (userStats as any[]).find(u => String(u.role) === 'resident')?.count || 0;
    const totalSecurityStaff = (userStats as any[]).find(u => String(u.role) === 'security')?.count || 0;
    const totalRevenue = (revenueStats as any[]).reduce((sum, r) => sum + Number(r.revenue), 0);

    return {
      overview: {
        totalEstates,
        totalResidents,
        totalSecurityStaff,
        totalRevenue,
        totalUsers: (userStats as any[]).reduce((sum, u) => sum + Number(u.count), 0)
      },
      estateBreakdown: (estateStats as any[]).map(estate => ({
        estate_id: estate.estate_id,
        name: estate.name,
        location: `${estate.city}, ${estate.state}`,
        status: estate.status,
        resident_count: Number(estate.resident_count)
      })),
      userRoleDistribution: (userStats as any[]).map(role => ({
        role: role.role,
        count: Number(role.count)
      })),
      monthlyRevenue: (revenueStats as any[]).map(month => ({
        month: month.month,
        revenue: Number(month.revenue),
        payment_count: Number(month.payment_count)
      })),
      accessTypeDistribution: (accessStats as any[]).map(access => ({
        type: access.access_type,
        count: Number(access.count)
      }))
    };
  },

  getEstateAnalytics: async (estateId: string) => {
    const [estateInfo, residents, securityStaff, recentAccess, revenue] = await Promise.all([
      Estate.findByPk(estateId, {
        attributes: ['estate_id', 'name', 'address', 'total_number_of_apartments', 'status']
      }),

      User.count({
        where: { estate_id: estateId, role: 'resident' }
      }),

      User.count({
        where: { estate_id: estateId, role: 'security' }
      }),

      AccessLog.count({
        where: {
          estate_id: estateId,
          created_at: {
            [Op.gte]: literal("NOW() - INTERVAL '30 days'")
          }
        }
      }),

      Payment.findAll({
        include: [{
          model: User,
          where: { estate_id: estateId },
          attributes: []
        }],
        where: { payment_status: 'completed' },
        attributes: [[fn('SUM', col('amount')), 'total']],
        raw: true
      }).then(result => (result[0] as any)?.total || 0)
    ]);

    return {
      estate: estateInfo,
      metrics: {
        totalResidents: residents,
        securityStaff: securityStaff,
        recentAccessCount: recentAccess,
        totalRevenue: revenue || 0,
        occupancyRate: estateInfo ? (residents / estateInfo.total_number_of_apartments * 100).toFixed(1) : 0
      }
    };
  }
};