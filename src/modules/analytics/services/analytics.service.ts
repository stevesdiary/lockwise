import sequelize from '../../../shared/core/database';
import { QueryTypes } from 'sequelize';
import redis from '../../../shared/core/redis';

/**
 * Validate and sanitize numeric input
 */
function validateDays(days: any): number {
  const parsed = parseInt(days, 10);
  if (isNaN(parsed) || parsed < 1 || parsed > 365) {
    throw new Error('Invalid days parameter. Must be between 1 and 365.');
  }
  return parsed;
}

/**
 * Validate date string format
 */
function validateDateString(date: string): string {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    throw new Error('Invalid date format. Expected YYYY-MM-DD');
  }
  
  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) {
    throw new Error('Invalid date value');
  }
  
  return date;
}

export const analyticsService = {
  async trackEvent(userId: string, event: string, properties?: any) {
    // ✅ SECURE - Using parameterized query
    await sequelize.query(`
      INSERT INTO analytics_events (user_id, event_name, properties, created_at)
      VALUES ($1, $2, $3, NOW())
    `, {
      bind: [userId, event, JSON.stringify(properties)],
      type: QueryTypes.INSERT
    });

    // Update real-time counters in Redis
    const today = new Date().toISOString().split('T')[0];
    await redis.incr(`analytics:events:${event}:${today}`);
    await redis.incr(`analytics:users:${userId}:${today}`);
  },

  async getUsageStats(startDate: string, endDate: string) {
    // ✅ SECURE - Validate dates before using
    const validStartDate = validateDateString(startDate);
    const validEndDate = validateDateString(endDate);

    const [stats] = await sequelize.query(`
      SELECT 
        COUNT(DISTINCT user_id) as active_users,
        COUNT(*) as total_events,
        COUNT(DISTINCT DATE(created_at)) as active_days,
        AVG(CASE WHEN event_name = 'login' THEN 1 ELSE 0 END) as avg_logins_per_day
      FROM analytics_events 
      WHERE created_at BETWEEN $1 AND $2
    `, {
      bind: [validStartDate, validEndDate],
      type: QueryTypes.SELECT
    }) as any[];

    const topEvents = await sequelize.query(`
      SELECT event_name, COUNT(*) as count
      FROM analytics_events 
      WHERE created_at BETWEEN $1 AND $2
      GROUP BY event_name 
      ORDER BY count DESC 
      LIMIT 10
    `, {
      bind: [validStartDate, validEndDate],
      type: QueryTypes.SELECT
    });

    return { ...stats, topEvents };
  },

  async getPerformanceMetrics() {
    // ✅ SECURE - No user input, using INTERVAL with constant
    const [metrics] = await sequelize.query(`
      SELECT 
        AVG(duration_ms) as avg_response_time,
        MAX(duration_ms) as max_response_time,
        COUNT(CASE WHEN status_code >= 400 THEN 1 END) as error_count,
        COUNT(*) as total_requests
      FROM audit_logs 
      WHERE created_at > NOW() - INTERVAL '24 hours'
    `, { type: QueryTypes.SELECT }) as any[];

    const slowQueries = await sequelize.query(`
      SELECT path, AVG(duration_ms) as avg_time, COUNT(*) as count
      FROM audit_logs 
      WHERE created_at > NOW() - INTERVAL '24 hours' AND duration_ms > 1000
      GROUP BY path 
      ORDER BY avg_time DESC 
      LIMIT 5
    `, { type: QueryTypes.SELECT });

    return { ...metrics, slowQueries };
  },

  async getUserBehavior(userId: string, days: number = 30) {
    // ✅ SECURE - Validate days parameter
    const validDays = validateDays(days);

    // ✅ SECURE - Calculate timestamp in application code
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - validDays);

    const [behavior] = await sequelize.query(`
      SELECT 
        COUNT(*) as total_actions,
        COUNT(DISTINCT DATE(created_at)) as active_days,
        COUNT(CASE WHEN event_name = 'access_code_generated' THEN 1 END) as codes_generated,
        COUNT(CASE WHEN event_name = 'payment_made' THEN 1 END) as payments_made,
        MAX(created_at) as last_activity
      FROM analytics_events 
      WHERE user_id = $1 AND created_at > $2
    `, {
      bind: [userId, startDate.toISOString()],
      type: QueryTypes.SELECT
    }) as any[];

    const eventPattern = await sequelize.query(`
      SELECT event_name, COUNT(*) as count, 
             EXTRACT(hour FROM created_at) as hour
      FROM analytics_events 
      WHERE user_id = $1 AND created_at > $2
      GROUP BY event_name, EXTRACT(hour FROM created_at)
      ORDER BY count DESC
    `, {
      bind: [userId, startDate.toISOString()],
      type: QueryTypes.SELECT
    });

    return { ...behavior, eventPattern };
  },

  async getSystemHealth() {
    const [[dbHealth], redisHealth] = await Promise.all([
      sequelize.query('SELECT NOW() as timestamp, COUNT(*) as user_count FROM users', {
        type: QueryTypes.SELECT
      }) as Promise<any[]>,
      redis.ping()
    ]);

    const recentErrors = await sequelize.query(`
      SELECT path, status_code, COUNT(*) as count
      FROM audit_logs 
      WHERE status_code >= 400 AND created_at > NOW() - INTERVAL '1 hour'
      GROUP BY path, status_code 
      ORDER BY count DESC 
      LIMIT 5
    `, { type: QueryTypes.SELECT });

    return {
      database: { status: 'healthy', ...dbHealth },
      redis: { status: redisHealth === 'PONG' ? 'healthy' : 'unhealthy' },
      recentErrors
    };
  }
};
