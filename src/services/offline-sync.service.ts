import { db } from '../core/database.optimized';
import { redisClient } from '../core/redis';

export const offlineSyncService = {
  async getUserSyncData(userId: string, lastSync?: string) {
    const syncTime = lastSync || '1970-01-01';
    
    const [user, accessCodes, notifications, estate] = await Promise.all([
      db.oneOrNone('SELECT * FROM users WHERE id = $1', [userId]),
      db.any('SELECT * FROM access_codes WHERE user_id = $1 AND updated_at > $2', [userId, syncTime]),
      db.any('SELECT * FROM notifications WHERE user_id = $1 AND created_at > $2 ORDER BY created_at DESC LIMIT 50', [userId, syncTime]),
      db.oneOrNone('SELECT * FROM estates WHERE id = (SELECT estate_id FROM users WHERE id = $1)', [userId])
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
    await redisClient.setex(syncId, 86400, JSON.stringify({ action, data, timestamp: new Date() }));
    return syncId;
  },

  async processPendingSync(userId: string) {
    const keys = await redisClient.keys(`sync:${userId}:*`);
    const results = [];

    for (const key of keys) {
      try {
        const syncData = await redisClient.get(key);
        if (syncData) {
          const { action, data } = JSON.parse(syncData);
          const result = await this.executeSync(action, data);
          results.push({ key, success: true, result });
          await redisClient.del(key);
        }
      } catch (error) {
        results.push({ key, success: false, error: error.message });
      }
    }

    return results;
  },

  async executeSync(action: string, data: any) {
    switch (action) {
      case 'create_access_code':
        return await db.one('INSERT INTO access_codes (user_id, guest_name, code, expires_at) VALUES ($1, $2, $3, $4) RETURNING *', 
          [data.userId, data.guestName, data.code, data.expiresAt]);
      
      case 'update_profile':
        return await db.one('UPDATE users SET first_name = $1, last_name = $2, phone = $3 WHERE id = $4 RETURNING *',
          [data.firstName, data.lastName, data.phone, data.userId]);
      
      case 'mark_notification_read':
        return await db.none('UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2',
          [data.notificationId, data.userId]);
      
      default:
        throw new Error(`Unknown sync action: ${action}`);
    }
  }
};