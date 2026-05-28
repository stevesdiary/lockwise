import db from '../../../shared/core/database';
import { QueryTypes } from 'sequelize';
import { Notification } from '../models/notification.model';

type FirebaseAdmin = typeof import('firebase-admin');

let firebaseAdmin: FirebaseAdmin | null = null;
let firebaseDisabledReason: string | null = null;

const getFirebaseAdmin = async (): Promise<FirebaseAdmin | null> => {
  if (firebaseDisabledReason) {
    return null;
  }

  if (!firebaseAdmin) {
    firebaseAdmin = await import('firebase-admin');
  }

  return firebaseAdmin;
};

const ensureFirebaseAdmin = async (): Promise<FirebaseAdmin | null> => {
  const admin = await getFirebaseAdmin();
  if (!admin) {
    return null;
  }

  if (admin.apps.length > 0) {
    return admin;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (
    !projectId ||
    !clientEmail ||
    !privateKey ||
    projectId === 'your_firebase_project_id' ||
    privateKey === 'your_firebase_private_key'
  ) {
    firebaseDisabledReason = 'Firebase credentials not configured, push notification service disabled';
    console.warn(firebaseDisabledReason);
    return null;
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    });

    return admin;
  } catch (error) {
    firebaseDisabledReason = 'Firebase initialization failed, push notification service disabled';
    console.warn(firebaseDisabledReason);
    return null;
  }
};

type NotificationDbType = 'access_granted' | 'access_denied' | 'visitor_arrival' | 'system_alert' | 'payment_reminder';

function toDbType(type: string): NotificationDbType {
  const map: Record<string, NotificationDbType> = {
    access_code:     'access_granted',
    access_granted:  'access_granted',
    access_denied:   'access_denied',
    visitor_arrival: 'visitor_arrival',
    payment:         'payment_reminder',
    payment_reminder:'payment_reminder',
    emergency:       'system_alert',
  };
  return map[type] ?? 'system_alert';
}

async function persistNotification(userId: string, title: string, body: string, type: string): Promise<void> {
  try {
    await Notification.create({
      user_id: userId,
      title,
      message: body,
      type: toDbType(type),
      is_read: false,
      sent_at: new Date()
    });
  } catch (err) {
    console.error('Failed to persist push notification to DB:', err);
  }
}

export const pushNotificationService = {
  async sendToUser(userId: string, title: string, body: string, data?: any) {
    // Persist to DB so notification screen shows it regardless of FCM delivery
    await persistNotification(userId, title, body, data?.type ?? 'system_alert');

    try {
      const admin = await ensureFirebaseAdmin();
      if (!admin) {
        console.warn('Firebase not initialized, skipping push notification');
        return;
      }

      const tokens = await db.query<{ fcm_token: string }>(
        'SELECT fcm_token FROM user_devices WHERE user_id = :userId AND fcm_token IS NOT NULL AND is_active = true',
        { replacements: { userId }, type: QueryTypes.SELECT }
      );

      if (!tokens || tokens.length === 0) return;

      const tokenList = tokens.map((t) => t.fcm_token);
      const message = {
        notification: { title, body },
        data: data ? { ...data, type: data.type ?? 'notification' } : { type: 'notification' },
      };

      const response = await admin.messaging().sendEachForMulticast({
        ...message,
        tokens: tokenList
      });

      const invalidTokens = response.responses
        .map((resp, idx) => (resp.success ? null : tokens[idx].fcm_token))
        .filter((t): t is string => t !== null);

      if (invalidTokens.length > 0) {
        await db.query(
          'DELETE FROM user_devices WHERE fcm_token IN (:tokens)',
          { replacements: { tokens: invalidTokens }, type: QueryTypes.DELETE }
        );
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
    const users = await db.query<{ user_id: string }>(
      'SELECT DISTINCT user_id FROM user_devices WHERE user_id IN (SELECT id FROM users WHERE estate_id = :estateId)',
      { replacements: { estateId }, type: QueryTypes.SELECT }
    );

    await Promise.all(users.map((user) =>
      this.sendToUser(user.user_id, 'Emergency Alert', message, { type: 'emergency' })
    ));
  }
};
