import admin from 'firebase-admin';
import { db } from '../core/database.optimized';

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export const pushNotificationService = {
  async sendToUser(userId: string, title: string, body: string, data?: any) {
    try {
      const tokens = await db.any('SELECT fcm_token FROM user_devices WHERE user_id = $1 AND fcm_token IS NOT NULL', [userId]);
      
      if (tokens.length === 0) return;

      const message = {
        notification: { title, body },
        data: data ? { ...data, type: 'notification' } : { type: 'notification' },
        tokens: tokens.map(t => t.fcm_token)
      };

      const response = await admin.messaging().sendMulticast(message);
      
      // Remove invalid tokens
      const invalidTokens = response.responses
        .map((resp, idx) => resp.success ? null : tokens[idx].fcm_token)
        .filter(Boolean);

      if (invalidTokens.length > 0) {
        await db.none('DELETE FROM user_devices WHERE fcm_token = ANY($1)', [invalidTokens]);
      }

      return response;
    } catch (error) {
      console.error('Push notification failed:', error);
    }
  },

  async sendAccessCode(userId: string, code: string, guestName: string) {
    await this.sendToUser(userId, 'New Access Code', `${guestName} has been granted access with code: ${code}`, {
      type: 'access_code',
      code,
      guestName
    });
  },

  async sendEmergencyAlert(estateId: string, message: string) {
    const users = await db.any('SELECT DISTINCT user_id FROM user_devices WHERE user_id IN (SELECT id FROM users WHERE estate_id = $1)', [estateId]);
    
    await Promise.all(users.map(user => 
      this.sendToUser(user.user_id, 'Emergency Alert', message, { type: 'emergency' })
    ));
  }
};