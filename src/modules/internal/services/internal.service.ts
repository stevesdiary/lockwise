import { QueryTypes } from 'sequelize';
import sequelize from '../../../shared/core/database';
import { Estate } from '../../estate/models/estate.model';
import { User } from '../../auth/models/user.model';
import { Subscription } from '../../payment/models/subscription.model';
import { Plan } from '../../payment/models/plan.model';
import { Payment } from '../../payment/models/payment.model';
import { Role } from '../../auth/models/role.model';
import monitoringService from '../../../shared/middleware/monitoring';

export const internalService = {
  async getDashboardMetrics() {
    const [estates, activeEstates, users, activeSubs, failedPayments, todaySignups, todayRevenueRow, metrics] =
      await Promise.all([
        Estate.count({ where: { deleted_at: null } as any }),
        Estate.count({ where: { status: 'active' } }),
        User.count(),
        Subscription.count({ where: { status: 'active' } }),
        Payment.count({ where: { payment_status: 'failed' } }),
        sequelize.query<{ count: string }>(
          `SELECT COUNT(*) as count FROM users WHERE created_at >= CURRENT_DATE`,
          { type: QueryTypes.SELECT },
        ).then(r => parseInt(r[0]?.count ?? '0', 10)),
        sequelize.query<{ total: string }>(
          `SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE payment_status = 'completed' AND payment_date >= CURRENT_DATE AND deleted_at IS NULL`,
          { type: QueryTypes.SELECT },
        ),
        Promise.resolve(monitoringService.getMetrics()),
      ]);

    // MRR: sum of active subscription plan prices (monthly equivalent)
    const [mrrRow] = await sequelize.query<{ mrr: string }>(
      `SELECT COALESCE(SUM(p.price), 0) as mrr FROM subscriptions s JOIN plans p ON s.plan_id = p.id WHERE s.status = 'active' AND s.deleted_at IS NULL`,
      { type: QueryTypes.SELECT },
    );

    const mrr = parseFloat(mrrRow?.mrr ?? '0');
    const todayRevenue = parseFloat(todayRevenueRow[0]?.total ?? '0');
    const health = metrics.successRate > 95 && metrics.avgResponseTime < 1000 ? 'healthy' : metrics.successRate > 80 ? 'degraded' : 'down';

    return {
      businesses: estates,
      activeBusinesses: activeEstates,
      users,
      mrr,
      arr: mrr * 12,
      activeSubscriptions: activeSubs,
      failedPayments,
      todaySignups,
      todayRevenue,
      systemHealth: health,
      avgResponseTimeMs: Math.round(metrics.avgResponseTime),
    };
  },

  async getBusinesses() {
    const estates = await Estate.findAll({
      where: { deleted_at: null } as any,
      attributes: ['estate_id', 'name', 'status', 'created_at'],
      include: [{ model: Plan, attributes: ['name', 'price'] }],
      order: [['created_at', 'DESC']],
    });

    const results = await Promise.all(
      estates.map(async (e: any) => {
        const userCount = await User.count({ where: { estate_id: e.estate_id } });
        const statusMap: Record<string, string> = { active: 'active', inactive: 'inactive', suspended: 'suspended', pending: 'inactive', draft: 'inactive', under_maintenance: 'active' };
        return {
          id: e.estate_id,
          name: e.name,
          status: statusMap[e.status] ?? 'inactive',
          plan: e.plan?.name ?? 'none',
          mrr: parseFloat(e.plan?.price ?? '0'),
          users: userCount,
          createdAt: e.created_at?.toISOString() ?? new Date().toISOString(),
        };
      }),
    );

    return results;
  },

  async getSubscriptions() {
    const subs = await Subscription.findAll({
      where: { deleted_at: null } as any,
      include: [
        { model: Plan, attributes: ['name', 'price'] },
        { model: Estate, attributes: ['estate_id', 'name'] },
      ],
      order: [['created_at', 'DESC']],
    });

    const statusMap: Record<string, string> = {
      active: 'active',
      inactive: 'paused',
      cancelled: 'cancelled',
      expired: 'cancelled',
      grace_period: 'past_due',
    };

    return subs.map((s: any) => ({
      id: s.id,
      businessId: s.estate?.estate_id ?? s.estate_id,
      businessName: s.estate?.name ?? 'Unknown',
      plan: s.plan?.name ?? 'unknown',
      status: statusMap[s.status] ?? 'cancelled',
      mrr: s.status === 'active' ? parseFloat(s.plan?.price ?? '0') : 0,
      renewsAt: s.end_date?.toISOString() ?? null,
      cancelledAt: s.status === 'cancelled' ? (s.updated_at?.toISOString() ?? null) : null,
      createdAt: s.created_at?.toISOString() ?? new Date().toISOString(),
    }));
  },

  async getRevenue() {
    const [[todayRow], [mtdRow], [ytdRow], [todayTxRow], [mtdTxRow], [refundRow], [outstandingRow]] =
      await Promise.all([
        sequelize.query<{ total: string }>(
          `SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE payment_status = 'completed' AND payment_date >= CURRENT_DATE AND deleted_at IS NULL`,
          { type: QueryTypes.SELECT },
        ),
        sequelize.query<{ total: string }>(
          `SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE payment_status = 'completed' AND payment_date >= date_trunc('month', CURRENT_DATE) AND deleted_at IS NULL`,
          { type: QueryTypes.SELECT },
        ),
        sequelize.query<{ total: string }>(
          `SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE payment_status = 'completed' AND payment_date >= date_trunc('year', CURRENT_DATE) AND deleted_at IS NULL`,
          { type: QueryTypes.SELECT },
        ),
        sequelize.query<{ count: string }>(
          `SELECT COUNT(*) as count FROM payments WHERE payment_status = 'completed' AND payment_date >= CURRENT_DATE AND deleted_at IS NULL`,
          { type: QueryTypes.SELECT },
        ),
        sequelize.query<{ count: string }>(
          `SELECT COUNT(*) as count FROM payments WHERE payment_status = 'completed' AND payment_date >= date_trunc('month', CURRENT_DATE) AND deleted_at IS NULL`,
          { type: QueryTypes.SELECT },
        ),
        sequelize.query<{ total: string }>(
          `SELECT COALESCE(SUM(COALESCE(refund_amount, 0)), 0) as total FROM payments WHERE payment_status = 'refunded' AND deleted_at IS NULL`,
          { type: QueryTypes.SELECT },
        ),
        sequelize.query<{ total: string }>(
          `SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE payment_status = 'pending' AND deleted_at IS NULL`,
          { type: QueryTypes.SELECT },
        ),
      ]);

    const mtdRevenue = parseFloat(mtdRow?.total ?? '0');

    return [{
      appKey: 'estate',
      todayRevenue: parseFloat(todayRow?.total ?? '0'),
      mtdRevenue,
      ytdRevenue: parseFloat(ytdRow?.total ?? '0'),
      todayTransactions: parseInt(todayTxRow?.count ?? '0', 10),
      mtdTransactions: parseInt(mtdTxRow?.count ?? '0', 10),
      commission: Math.round(mtdRevenue * 0.05 * 100) / 100, // 5% platform commission
      refunds: parseFloat(refundRow?.total ?? '0'),
      outstanding: parseFloat(outstandingRow?.total ?? '0'),
      currency: 'NGN',
    }];
  },

  async getUsers() {
    const users = await User.findAll({
      attributes: ['id', 'email', 'first_name', 'last_name', 'user_type', 'status', 'estate_id', 'created_at'],
      include: [
        { model: Estate, attributes: ['estate_id', 'name'] },
      ],
      order: [['created_at', 'DESC']],
      limit: 500,
    });

    const statusMap: Record<string, string> = { active: 'active', inactive: 'inactive', suspended: 'suspended', pending: 'inactive' };

    return users.map((u: any) => ({
      id: u.id,
      email: u.email,
      name: `${u.first_name} ${u.last_name}`.trim(),
      role: u.user_type ?? 'resident',
      status: statusMap[u.status] ?? 'inactive',
      businessId: u.estate?.estate_id ?? u.estate_id ?? null,
      businessName: u.estate?.name ?? null,
      lastLoginAt: null,
      createdAt: u.created_at?.toISOString() ?? new Date().toISOString(),
    }));
  },
};
