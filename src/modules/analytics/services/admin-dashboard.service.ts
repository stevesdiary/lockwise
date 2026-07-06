import db from '../../../shared/core/database';
import { QueryTypes } from 'sequelize';
import { Estate } from '../../estate/models/estate.model';
import { User } from '../../auth/models/user.model';
import { Referrer } from '../../payment/models/referrer.model';
import AccessLog from '../../access/models/access-log.model';

export const adminDashboardService = {
  async getDashboardStats() {
    const [estates, residents, referrers, accessCodes] = await Promise.all([
      Estate.count(),
      User.count({ where: { role: 'resident' } }),
      Referrer.count(),
      AccessLog.count()
    ]);

    return {
      total_estates: estates,
      total_residents: residents,
      total_referrers: referrers,
      total_access_codes: accessCodes
    };
  },

  async getEstateList(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    
    const { rows: estates, count } = await Estate.findAndCountAll({
      limit,
      offset,
      order: [['created_at', 'DESC']],
      attributes: ['id', 'name', 'address', 'city', 'state', 'manager_email', 'total_units', 'created_at']
    });

    return {
      estates,
      total: count,
      page,
      totalPages: Math.ceil(count / limit)
    };
  },

  async getResidentStatistics() {
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total_residents,
        COUNT(CASE WHEN is_verified = true THEN 1 END) as verified_residents,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 END) as new_this_month,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as new_this_week
      FROM users 
      WHERE role = 'resident'
    `, {
      type: QueryTypes.SELECT
    }) as any;

    const byEstate = await db.query(`
      SELECT 
        e.name as estate_name,
        COUNT(u.id) as resident_count
      FROM estates e
      LEFT JOIN users u ON e.id = u.estate_id AND u.role = 'resident'
      GROUP BY e.id, e.name
      ORDER BY resident_count DESC
      LIMIT 10
    `, {
      type: QueryTypes.SELECT
    });

    return { ...stats, by_estate: byEstate };
  },

  async getAccessCodeStatistics() {
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total_codes,
        COUNT(CASE WHEN expires_at > NOW() THEN 1 END) as active_codes,
        COUNT(CASE WHEN expires_at < NOW() THEN 1 END) as expired_codes,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 END) as generated_this_month,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as generated_this_week
      FROM access_codes
    `, {
      type: QueryTypes.SELECT
    }) as any;

    const byType = await db.query(`
      SELECT 
        access_type,
        COUNT(*) as count
      FROM access_codes
      GROUP BY access_type
      ORDER BY count DESC
    `, {
      type: QueryTypes.SELECT
    });

    const topGenerators = await db.query(`
      SELECT 
        u.first_name || ' ' || u.last_name as user_name,
        u.email,
        COUNT(ac.id) as codes_generated
      FROM users u
      INNER JOIN access_codes ac ON u.id = ac.user_id
      GROUP BY u.id, u.first_name, u.last_name, u.email
      ORDER BY codes_generated DESC
      LIMIT 10
    `, {
      type: QueryTypes.SELECT
    });

    return { ...stats, by_type: byType, top_generators: topGenerators };
  },

  async getReferrerStatistics() {
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total_referrers,
        SUM(total_earnings) as total_earnings,
        AVG(total_earnings) as avg_earnings_per_referrer
      FROM referrers
    `, {
      type: QueryTypes.SELECT
    }) as any;

    const topReferrers = await db.query(`
      SELECT 
        r.name,
        r.email,
        r.referral_code,
        r.total_earnings,
        COUNT(rb.id) as total_referrals,
        SUM(CASE WHEN rb.paid = false THEN rb.bonus_amount ELSE 0 END) as pending_amount
      FROM referrers r
      LEFT JOIN referral_bonuses rb ON r.id = rb.referrer_id
      GROUP BY r.id, r.name, r.email, r.referral_code, r.total_earnings
      ORDER BY r.total_earnings DESC
      LIMIT 10
    `, {
      type: QueryTypes.SELECT
    });

    return { ...stats, top_referrers: topReferrers };
  },

  async getRecentActivity(limit = 20) {
    const recentEstates = await Estate.findAll({
      limit: 5,
      order: [['created_at', 'DESC']],
      attributes: ['id', 'name', 'created_at']
    });

    const recentResidents = await User.findAll({
      where: { role: 'resident' },
      limit: 5,
      order: [['created_at', 'DESC']],
      attributes: ['id', 'first_name', 'last_name', 'email', 'created_at']
    });

    const recentAccessCodes = await AccessLog.findAll({
      limit: 5,
      order: [['created_at', 'DESC']],
      attributes: ['id', 'guest_name', 'access_code', 'created_at']
    });

    return {
      recent_estates: recentEstates,
      recent_residents: recentResidents,
      recent_access_codes: recentAccessCodes
    };
  },

  async getSuperAdminAnalytics() {
    const [totalEstates, estatesWithoutActiveSub, revenueRows] = await Promise.all([
      Estate.count(),

      // Estates that exist but have no subscription with status='active'
      db.query<{ estate_id: string; name: string; approval_status: string }>(`
        SELECT e.estate_id, e.name, e.approval_status
        FROM estates e
        WHERE e.deleted_at IS NULL
          AND NOT EXISTS (
            SELECT 1 FROM subscriptions s
            WHERE s.estate_id = e.estate_id
              AND s.status = 'active'
              AND s.deleted_at IS NULL
          )
        ORDER BY e.created_at DESC
      `, { type: QueryTypes.SELECT }),

      // Total revenue from completed payments
      db.query<{ total_revenue: string }>(`
        SELECT COALESCE(SUM(amount), 0) AS total_revenue
        FROM payments
        WHERE payment_status = 'completed'
          AND deleted_at IS NULL
      `, { type: QueryTypes.SELECT }),
    ]);

    const totalRevenue = parseFloat((revenueRows[0] as any)?.total_revenue ?? '0');

    return {
      total_estates: totalEstates,
      total_revenue: totalRevenue,
      estates_without_active_subscription: estatesWithoutActiveSub,
      inactive_count: estatesWithoutActiveSub.length,
    };
  },
};