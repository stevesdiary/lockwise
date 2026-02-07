import admin from 'firebase-admin';
import db from '../../../shared/core/database';
import { QueryTypes } from 'sequelize';

// Initialize Firebase Admin
try {
  if (!admin.apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    
    if (projectId && clientEmail && privateKey && 
        projectId !== 'your_firebase_project_id' && 
        privateKey !== 'your_firebase_private_key') {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
      });
    } else {
      console.warn('Firebase credentials not configured, push notification service disabled');
    }
  }
} catch (error) {
  console.warn('Firebase initialization failed, push notification service disabled');
}

export const pushNotificationService = {
  async sendToUser(userId: string, title: string, body: string, data?: any) {
    try {
      if (!admin.apps.length) {
        console.warn('Firebase not initialized, skipping push notification');
        return;
      }
      
      const [tokens] = await db.query('SELECT fcm_token FROM user_devices WHERE user_id = ? AND fcm_token IS NOT NULL', {
        replacements: [userId],
        type: QueryTypes.SELECT
      }) as any;
      
      if (!tokens || tokens.length === 0) return;

      const tokenList = tokens.map((t: any) => t.fcm_token);

      const message = {
        notification: { title, body },
        data: data ? { ...data, type: 'notification' } : { type: 'notification' },
      };

      const response = await admin.messaging().sendEachForMulticast({
        ...message,
        tokens: tokenList
      });
      
      const invalidTokens = response.responses
        .map((resp, idx) => resp.success ? null : tokens[idx].fcm_token)
        .filter(Boolean);

      if (invalidTokens.length > 0) {
        await db.query('DELETE FROM user_devices WHERE fcm_token = ANY(?)', {
          replacements: [invalidTokens]
        });
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
    const [users] = await db.query('SELECT DISTINCT user_id FROM user_devices WHERE user_id IN (SELECT id FROM users WHERE estate_id = ?)', {
      replacements: [estateId],
      type: QueryTypes.SELECT
    }) as any;
    
    await Promise.all(users.map((user: any) => 
      this.sendToUser(user.user_id, 'Emergency Alert', message, { type: 'emergency' })
    ));
  }
};
