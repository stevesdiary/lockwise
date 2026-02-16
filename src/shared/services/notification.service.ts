import whatsappService from './whatsapp.service';
import templateService, { NotificationChannel, TemplateType } from './template.service';
import logger from '../utils/logger';

class NotificationService {
  async sendEntryNotification(residentPhone: string, guestName: string, accessCode: string, action: 'approved' | 'rejected') {
    //  
  }

  async sendRealTimeEntryNotification(residentPhone: string, guestName: string) {
    // Automatic WhatsApp/SMS notifications disabled - only push notifications sent
    // try {
    //   const template = templateService.getTemplate(NotificationChannel.WHATSAPP, TemplateType.GUEST_ENTERED, {
    //     guestName
    //   })

    //   await whatsappService.sendMessage(residentPhone, template.text);
    //   logger.info(`Real-time entry notification sent to ${residentPhone}`);
    // } catch (error) {
    //   logger.error('Failed to send real-time entry notification:', error);
    // }
  }

  async sendRealTimeExitNotification(residentPhone: string, guestName: string) {
    // Automatic WhatsApp/SMS notifications disabled - only push notifications sent
    // try {
    //   const template = templateService.getTemplate(NotificationChannel.WHATSAPP, TemplateType.GUEST_EXITED, {
    //     guestName
    //   });

    //   await whatsappService.sendMessage(residentPhone, template.text);
    //   logger.info(`Real-time exit notification sent to ${residentPhone}`);
    // } catch (error) {
    //   logger.error('Failed to send real-time exit notification:', error);
    // }
  }
}

export default new NotificationService();
