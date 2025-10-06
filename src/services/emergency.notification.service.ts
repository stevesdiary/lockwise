import { EmergencyAlert } from '../models/emergency.model';
import { User } from '../models/user.model';
import pushNotificationService from './push.notification.service';
import { saveToRedis } from '../core/redis';

class EmergencyNotificationService {
  async broadcastEmergencyAlert(alert: EmergencyAlert) {
    // Get all estate users
    const users = await User.findAll({
      where: { estate_id: alert.estate_id },
      attributes: ['id', 'first_name', 'last_name', 'phone', 'email']
    });

    // Send push notifications
    const notificationPromises = users.map(user => 
      pushNotificationService.sendToUser(user.id, {
        title: `🚨 EMERGENCY: ${alert.type.toUpperCase()}`,
        message: `${alert.description} at ${alert.location}. Please stay safe and follow emergency procedures.`,
        type: 'system_alert',
        data: { 
          alert_id: alert.id, 
          emergency_type: alert.type,
          location: alert.location,
          priority: 'urgent'
        }
      })
    );

    await Promise.all(notificationPromises);

    // Store alert in Redis for real-time updates
    await saveToRedis(`emergency:${alert.estate_id}:${alert.id}`, JSON.stringify({
      id: alert.id,
      type: alert.type,
      description: alert.description,
      location: alert.location,
      status: alert.status,
      created_at: alert.created_at
    }), 3600); // 1 hour expiry

    return users.length;
  }

  async sendAlertUpdate(alertId: string, estateId: string, status: string) {
    const users = await User.findAll({
      where: { estate_id: estateId },
      attributes: ['id']
    });

    const updateMessage = status === 'resolved' 
      ? '✅ Emergency has been resolved. Thank you for your cooperation.'
      : `⚠️ Emergency status updated to: ${status}`;

    const notificationPromises = users.map(user => 
      pushNotificationService.sendToUser(user.id, {
        title: 'Emergency Update',
        message: updateMessage,
        type: 'system_alert',
        data: { alert_id: alertId, status }
      })
    );

    await Promise.all(notificationPromises);
    return users.length;
  }

  async sendCriticalAlert(estateId: string, message: string) {
    const users = await User.findAll({
      where: { estate_id: estateId },
      attributes: ['id']
    });

    const notificationPromises = users.map(user => 
      pushNotificationService.sendToUser(user.id, {
        title: '🚨 CRITICAL ALERT',
        message,
        type: 'system_alert',
        data: { priority: 'critical' }
      })
    );

    await Promise.all(notificationPromises);
    return users.length;
  }
}

export default new EmergencyNotificationService();