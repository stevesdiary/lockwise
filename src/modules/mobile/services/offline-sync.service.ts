import sequelize from '../../../shared/core/database';
import { saveToRedis, getFromRedis, deleteFromRedis } from '../../../shared/core/redis';
import { User } from '../../auth/models/user.model';
import { Estate } from '../../estate/models/estate.model';
import { QueryTypes } from 'sequelize';

export const offlineSyncService = {
  async getUserSyncData(userId: string, lastSync?: string) {
    const syncTime = lastSync || '1970-01-01';
    
    const [user, accessCodes, notifications, estate] = await Promise.all([
      sequelize.query('SELECT * FROM users WHERE id = $1', { bind: [userId], type: QueryTypes.SELECT, plain: true }),
      sequelize.query('SELECT * FROM access_codes WHERE user_id = $1 AND updated_at > $2', { bind: [userId, syncTime], type: QueryTypes.SELECT }),
      sequelize.query('SELECT * FROM notifications WHERE user_id = $1 AND created_at > $2 ORDER BY created_at DESC LIMIT 50', { bind: [userId, syncTime], type: QueryTypes.SELECT }),
      sequelize.query('SELECT * FROM estates WHERE id = (SELECT estate_id FROM users WHERE id = $1)', { bind: [userId], type: QueryTypes.SELECT, plain: true })
    ]);

    return {
      user,
      accessCodes,
      notifications,
      estate,
      syncTimestamp: new Date().toISOString()
    };
  },

  async storePendingSync(userId: string, action: string, data: any) {
    const syncId = `sync:${userId}:${Date.now()}`;
    await saveToRedis(syncId, { action, data, timestamp: new Date() }, 86400);
    return syncId;
  },

  async processPendingSync(userId: string) {
    const keys = await sequelize.query('SELECT key FROM redis_keys WHERE key LIKE $1', { bind: [`sync:${userId}:*`], type: QueryTypes.SELECT }) as any[];
    const results = [];

    for (const { key } of keys) {
      try {
        const syncData = await getFromRedis<{ action: string; data: unknown }>(key);
        if (syncData) {
          const { action, data } = syncData;
          const result = await this.executeSync(action, data);
          results.push({ key, success: true, result });
          await deleteFromRedis(key);
        }
      } catch (error) {
        results.push({ key, success: false, error: (error as Error).message });
      }
    }

    return results;
  },

  async executeSync(action: string, data: any) {
    switch (action) {
      case 'create_access_code':
        return await sequelize.query('INSERT INTO access_codes (user_id, guest_name, code, expires_at) VALUES ($1, $2, $3, $4) RETURNING *', 
          { bind: [data.userId, data.guestName, data.code, data.expiresAt], type: QueryTypes.INSERT });
      
      case 'update_profile':
        return await sequelize.query('UPDATE users SET first_name = $1, last_name = $2, phone = $3 WHERE id = $4 RETURNING *',
          { bind: [data.firstName, data.lastName, data.phone, data.userId], type: QueryTypes.UPDATE });
      
      case 'mark_notification_read':
        return await sequelize.query('UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2',
          { bind: [data.notificationId, data.userId], type: QueryTypes.UPDATE });
      
      default:
        throw new Error(`Unknown sync action: ${action}`);
    }
  }
};