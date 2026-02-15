import whatsappService from './whatsapp.service';
import templateService, { NotificationChannel, TemplateType } from './template.service';
import logger from '../utils/logger';

class NotificationService {
  async sendEntryNotification(residentPhone: string, guestName: string, accessCode: string, action: 'approved' | 'rejected') {
    try {
      const templateType = action === 'approved' ? TemplateType.ENTRY_APPROVED : TemplateType.ENTRY_REJECTED;
      const template = templateService.getTemplate(NotificationChannel.WHATSAPP, templateType, {
        guestName,
        accessCode
      });

      await whatsappService.sendMessage(residentPhone, template.text);
      logger.info(`Entry notification sent to ${residentPhone} for ${action} access`);
    } catch (error) {
      logger.error('Failed to send entry notification:', error);
    }
  }

  async sendRealTimeEntryNotification(residentPhone: string, guestName: string) {
    try {
      const template = templateService.getTemplate(NotificationChannel.WHATSAPP, TemplateType.GUEST_ENTERED, {
        guestName
      });

      await whatsappService.sendMessage(residentPhone, template.text);
      logger.info(`Real-time entry notification sent to ${residentPhone}`);
    } catch (error) {
      logger.error('Failed to send real-time entry notification:', error);
    }
  }

  async sendRealTimeExitNotification(residentPhone: string, guestName: string) {
    try {
      const template = templateService.getTemplate(NotificationChannel.WHATSAPP, TemplateType.GUEST_EXITED, {
        guestName
      });

      await whatsappService.sendMessage(residentPhone, template.text);
      logger.info(`Real-time exit notification sent to ${residentPhone}`);
    } catch (error) {
      logger.error('Failed to send real-time exit notification:', error);
    }
  }
}

export default new NotificationService();
