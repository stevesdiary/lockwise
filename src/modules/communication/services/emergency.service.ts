import { EmergencyAlert, EmergencyContact } from '../models/emergency.model';
import { User } from '../../auth';
import pushNotificationService from './push-notification.service';

class EmergencyService {
  async createAlert(data: {
    estate_id: string;
    user_id: string;
    type: string;
    description: string;
    location: string;
  }) {
    const alert = await EmergencyAlert.create({ ...data, status: 'active' });

    // Notify all estate residents and security
    await this.notifyEmergencyAlert(alert);

    return alert;
  }

  async getEstateAlerts(estateId: string, status?: string) {
    const whereClause: any = { estate_id: estateId };
    if (status) whereClause.status = status;

    return await EmergencyAlert.findAll({
      where: whereClause,
      include: [{
        model: User,
        attributes: ['id', 'first_name', 'last_name', 'phone']
      }],
      order: [['created_at', 'DESC']]
    });
  }

  async resolveAlert(alertId: string, resolvedBy: string) {
    const [updatedCount] = await EmergencyAlert.update(
      { 
        status: 'resolved',
        resolved_at: new Date(),
        resolved_by: resolvedBy
      },
      { where: { id: alertId } }
    );
    return updatedCount > 0;
  }

  async getEmergencyContacts(estateId: string) {
    return await EmergencyContact.findAll({
      where: { estate_id: estateId, is_active: true },
      order: [['type', 'ASC'], ['name', 'ASC']]
    });
  }

  async createEmergencyContact(data: {
    estate_id: string;
    name: string;
    type: string;
    phone: string;
    email?: string;
    address?: string;
  }) {
    return await EmergencyContact.create(data);
  }

  async updateEmergencyContact(contactId: string, data: any) {
    const [updatedCount] = await EmergencyContact.update(data, { where: { id: contactId } });
    return updatedCount > 0;
  }

  private async notifyEmergencyAlert(alert: EmergencyAlert) {
    // Send push notification to all estate residents
    await pushNotificationService.sendToEstate(alert.estate_id, {
      title: `🚨 EMERGENCY ALERT - ${alert.type.toUpperCase()}`,
      message: `${alert.description} at ${alert.location}`,
      type: 'system_alert',
      data: { alert_id: alert.id, emergency_type: alert.type }
    });
  }
}

export default new EmergencyService();