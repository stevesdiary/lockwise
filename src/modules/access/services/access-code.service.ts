import AccessLog from '../models/access-log.model';
import whatsappService from '../../../shared/services/whatsapp.service';

export class AccessCodeService {
  async generateCode(data: any) {
    const accessLog = await AccessLog.create({
      ...data,
      access_code: data.code,
      status: 'pending'
    });

    if (data.guest_phone && data.guest_name) {
      const sent = await whatsappService.sendAccessCode(
        data.guest_phone,
        data.code,
        data.guest_name,
        data.valid_until
      );
      
      if (sent) {
        await accessLog.update({
          whatsapp_sent: true,
          whatsapp_sent_at: new Date()
        });
      }
    }

    return accessLog;
  }

  async validateCode(code: string) {
    return await AccessLog.findOne({ where: { access_code: code } });
  }

  async getWhatsAppUrl(accessLogId: string): Promise<string | null> {
    const accessLog = await AccessLog.findByPk(accessLogId);
    
    if (!accessLog || !accessLog.access_code) {
      return null;
    }

    const message = `Hello ${accessLog.guest_name || 'Guest'},\n\nYour access code is: *${accessLog.access_code}*\n\nValid until: ${new Date(accessLog.valid_until!).toLocaleString()}\n\nPlease present this code at the gate.\n\nThank you!`;
    
    return null;
  }
}

export default new AccessCodeService();
