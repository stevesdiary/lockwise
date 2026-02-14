import axios from 'axios';

export class WhatsAppService {
  private apiUrl: string;
  private apiToken: string;

  constructor() {
    this.apiUrl = process.env.WHATSAPP_API_URL || 'https://api.whatsapp.com/send';
    this.apiToken = process.env.WHATSAPP_API_TOKEN || '';
  }

  async sendAccessCode(phone: string, accessCode: string, guestName: string, validUntil: Date): Promise<boolean> {
    try {
      const message = this.formatAccessCodeMessage(accessCode, guestName, validUntil);
      return await this.sendMessage(phone, message);
    } catch (error) {
      console.error('WhatsApp send error:', error);
      return false;
    }
  }

  async sendMessage(phone: string, message: string): Promise<boolean> {
    try {
      const formattedPhone = this.formatPhoneNumber(phone);
      const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
      
      console.log('WhatsApp URL:', whatsappUrl);
      return true;
    } catch (error) {
      console.error('WhatsApp send error:', error);
      return false;
    }
  }

  private formatAccessCodeMessage(code: string, guestName: string, validUntil: Date): string {
    const validUntilStr = new Date(validUntil).toLocaleString();
    return `Hello ${guestName},\n\nYour access code is: *${code}*\n\nValid until: ${validUntilStr}\n\nPlease present this code at the gate.\n\nThank you!`;
  }

  private formatPhoneNumber(phone: string): string {
    // Remove all non-numeric characters
    let cleaned = phone.replace(/\D/g, '');
    
    // Add country code if not present (assuming Nigeria +234)
    if (!cleaned.startsWith('234') && cleaned.startsWith('0')) {
      cleaned = '234' + cleaned.substring(1);
    } else if (!cleaned.startsWith('234')) {
      cleaned = '234' + cleaned;
    }
    
    return cleaned;
  }

  getWhatsAppUrl(phone: string, message: string): string {
    const formattedPhone = this.formatPhoneNumber(phone);
    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
  }
}

export default new WhatsAppService();
