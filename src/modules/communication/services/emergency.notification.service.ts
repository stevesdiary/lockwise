import { EmergencyAlert } from "../models/emergency.model";
import { User } from "../../auth/models/user.model";
import { Resident } from "../../estate/models/resident.model";
import pushNotificationService from './push.notification.service';
import { saveToRedis } from "../../../shared/core/redis";

class EmergencyNotificationService {
  async broadcastEmergencyAlert(alert: EmergencyAlert) {
    let users: any[];

    if (alert.type === 'medical') {
      // Medical alerts go only to neighbours sharing the same unit as the reporter
      const reporterResident = await Resident.findOne({
        where: { user_id: alert.user_id },
        attributes: ['unit_id']
      });

      if (reporterResident?.unit_id) {
        const unitResidents = await Resident.findAll({
          where: { unit_id: reporterResident.unit_id },
          attributes: ['user_id']
        });
        const unitUserIds = unitResidents.map((r: any) => r.user_id);
        users = await User.findAll({
          where: { id: unitUserIds },
          attributes: ["id", "first_name", "last_name", "phone", "email"],
        });
      } else {
        // Reporter has no unit — fall back to all estate residents
        users = await User.findAll({
          where: { estate_id: alert.estate_id },
          attributes: ["id", "first_name", "last_name", "phone", "email"],
        });
      }
    } else {
      // All other emergencies (fire, security, flood, etc.) notify the whole estate
      users = await User.findAll({
        where: { estate_id: alert.estate_id },
        attributes: ["id", "first_name", "last_name", "phone", "email"],
      });
    }

    const notificationPromises = users.map((user: any) =>
      pushNotificationService.sendToUser(
        user.id,
        `🚨 EMERGENCY: ${alert.type.toUpperCase()}`,
        `${alert.description} at ${alert.location}. Please stay safe and follow emergency procedures.`,
        { alert_id: alert.id, emergency_type: alert.type, location: alert.location, priority: 'urgent', type: 'emergency' }
      )
    );

    await Promise.all(notificationPromises);

    await saveToRedis(
      `emergency:${alert.estate_id}:${alert.id}`,
      JSON.stringify({
        id: alert.id,
        type: alert.type,
        description: alert.description,
        location: alert.location,
        status: alert.status,
        created_at: alert.createdAt,
      }),
      3600
    );

    return users.length;
  }

  async sendAlertUpdate(alertId: string, estateId: string, status: string) {
    const users = await User.findAll({
      where: { estate_id: estateId },
      attributes: ["id"],
    });

    const updateMessage =
      status === "resolved"
        ? "✅ Emergency has been resolved. Thank you for your cooperation."
        : `⚠️ Emergency status updated to: ${status}`;

    const notificationPromises = users.map((user: any) =>
      pushNotificationService.sendToUser(
        user.id,
        'Emergency Update',
        updateMessage,
        { alert_id: alertId, status, type: 'emergency' }
      )
    );

    await Promise.all(notificationPromises);
    return users.length;
  }

  async sendCriticalAlert(estateId: string, message: string) {
    const users = await User.findAll({
      where: { estate_id: estateId },
      attributes: ["id"],
    });

    const notificationPromises = users.map((user: any) =>
      pushNotificationService.sendToUser(
        user.id,
        '🚨 CRITICAL ALERT',
        message,
        { priority: 'critical', type: 'emergency' }
      )
    );

    await Promise.all(notificationPromises);
    return users.length;
  }
}

export default new EmergencyNotificationService();
