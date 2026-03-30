import AccessLog from '../models/access-log.model';
import whatsappService from '../../../shared/services/whatsapp.service';

export class AccessCodeService {
  async generateCode(data: any) {
    const accessLog = await AccessLog.create({
      ...data,
      access_code: data.code,
      status: 'active'
    });

    // TODO: Uncomment when guest_phone is added to AccessLog model
    // if (data.guest_phone && data.guest_name) {
    //   const message = data.message || this.formatAccessCodeMessage(
    //     data.code,
    //     data.guest_name,
    //     data.valid_until
    //   );
    //   
    //   const sent = await whatsappService.sendMessage(data.guest_phone, message);
    //   
    //   if (sent) {
    //     await accessLog.update({
    //       whatsapp_sent: true,
    //       whatsapp_sent_at: new Date()
    //     });
    //   }
    // }

    return accessLog;
  }

  private formatAccessCodeMessage(code: string, guestName: string, validUntil: Date): string {
    const validUntilStr = new Date(validUntil).toLocaleString();
    return `Hello ${guestName},\n\nYour access code is: *${code}*\n\nValid until: ${validUntilStr}\n\nPlease present this code at the gate.\n\nThank you!`;
  }

  async validateCode(code: string) {
    return await AccessLog.findOne({ where: { access_code: code } });
  }

  async getWhatsAppUrl(accessLogId: string): Promise<string | null> {
    const accessLog = await AccessLog.findByPk(accessLogId);
    
    if (!accessLog || !accessLog.access_code) {
      return null;
    }

    // TODO: Uncomment when guest_phone is added to AccessLog model
    // const message = this.formatAccessCodeMessage(
    //   accessLog.access_code,
    //   accessLog.guest_name || 'Guest',
    //   accessLog.valid_until!
    // );
    // 
    // return whatsappService.getWhatsAppUrl(accessLog.guest_phone || '', message);
    
    return null;
  }
}

export default new AccessCodeService();
