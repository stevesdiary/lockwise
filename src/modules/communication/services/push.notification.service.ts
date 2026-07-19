import { Notification } from '../../communication/models/notification.model';
import { User } from '../../auth/models/user.model';
import { saveToRedis, getFromRedis } from '../../../shared/core/redis';

interface PushNotificationData {
  title: string;
  message: string;
  type: string;
  data?: any;
}

class PushNotificationService {
  // Store user's push subscription
  async subscribeToPush(userId: string, subscription: any) {
    await saveToRedis(`push_subscription:${userId}`, subscription, 86400 * 30); // 30 days
    return true;
  }

  // Send push notification to specific user
  // Supports both (userId, PushNotificationData) and (userId, title, body, data?) overloads
  async sendToUser(userId: string, notificationData: PushNotificationData): Promise<any>;
  async sendToUser(userId: string, title: string, body: string, data?: any): Promise<any>;
  async sendToUser(userId: string, titleOrData: string | PushNotificationData, body?: string, data?: any): Promise<any> {
    const notificationData: PushNotificationData = typeof titleOrData === 'string'
      ? { title: titleOrData, message: body || '', type: data?.type ?? 'system_alert', data }
      : titleOrData;

    try {
      // Save to database
      const notification = await Notification.create({
        user_id: userId,
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type,
        data: notificationData.data,
        is_read: false,
        sent_at: new Date()
      });

      // Get user's push subscription
      const subscription = await getFromRedis(`push_subscription:${userId}`);

      if (subscription) {
        await this.sendWebPush(subscription, notificationData);
      }

      // Store in Redis for real-time notifications
      await saveToRedis(`notification:${userId}:${notification.id}`, notification, 86400);

      return notification;
    } catch (error) {
      console.error('Error sending push notification:', error);
      throw error;
    }
  }

  // Send to multiple users (by estate)
  async sendToEstate(estateId: string, notificationData: PushNotificationData) {
    const users = await User.findAll({
      where: { estate_id: estateId },
      attributes: ['id']
    });

    const notifications = await Promise.all(
      users.map(user => this.sendToUser(user.id, notificationData))
    );

    return notifications;
  }

  // Send access-related notifications
  async sendAccessNotification(userId: string, accessType: 'granted' | 'denied', details: any) {
    const notificationData = {
      title: accessType === 'granted' ? 'Access Granted' : 'Access Denied',
      message: accessType === 'granted' 
        ? `Access granted for ${details.visitorName || 'visitor'}` 
        : `Access denied for ${details.reason || 'security reasons'}`,
      type: `access_${accessType}`,
      data: details
    };

    return await this.sendToUser(userId, notificationData);
  }

  // Get user notifications
  async getUserNotifications(userId: string, limit: number = 20) {
    return await Notification.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      limit
    });
  }

  // Mark notification as read
  async markAsRead(notificationId: string, userId: string) {
    const [updatedCount] = await Notification.update(
      { is_read: true },
      { where: { id: notificationId, user_id: userId } }
    );
    return updatedCount > 0;
  }

  // Mark all notifications as read
  async markAllAsRead(userId: string) {
    const [updatedCount] = await Notification.update(
      { is_read: true },
      { where: { user_id: userId, is_read: false } }
    );
    return updatedCount;
  }

  private async sendWebPush(subscription: any, data: PushNotificationData) {
    // Web Push implementation would go here
    // For now, we'll just log it
    console.log('Sending web push:', { subscription, data });
    
    // In production, you would use a library like 'web-push'
    // const webpush = require('web-push');
    // await webpush.sendNotification(subscription, JSON.stringify(data));
  }
}

export default new PushNotificationService();