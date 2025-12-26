import twilio from 'twilio';
import { smsTemplates } from '../templates/sms.templates';

interface SMSData {
  to: string;
  template: keyof typeof smsTemplates;
  data: any;
}

class SMSService {
  private client: twilio.Twilio;
  private fromNumber: string;

  constructor() {
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    this.fromNumber = process.env.SENDER_PHONE_NUMBER || '+13868543060';
  }

  async sendSMS(smsData: SMSData): Promise<boolean> {
    try {
      const message = smsTemplates[smsData.template](smsData.data);
      
      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: this.formatPhoneNumber(smsData.to),
      });

      console.log(`SMS sent successfully: ${result.sid}`);
      return true;
    } catch (error) {
      console.error('SMS sending failed:', error);
      return false;
    }
  }

  private formatPhoneNumber(phone: string): string {
    // Convert Nigerian format to international
    if (phone.startsWith('0')) {
      return '+234' + phone.substring(1);
    }
    if (!phone.startsWith('+')) {
      return '+234' + phone;
    }
    return phone;
  }

  async sendVerificationSMS(to: string, name: string, code: string): Promise<boolean> {
    return this.sendSMS({
      to,
      template: 'verification',
      data: { name, code }
    });
  }

  async sendAccessCodeSMS(to: string, name: string, access_code: string, valid_until: string): Promise<boolean> {
    return this.sendSMS({
      to,
      template: 'accessCode',
      data: { name, access_code, valid_until }
    });
  }

  async sendPasswordResetSMS(to: string, name: string, code: string): Promise<boolean> {
    return this.sendSMS({
      to,
      template: 'passwordReset',
      data: { name, code }
    });
  }

  async sendEmergencyAlert(to: string, alert_type: string, location: string): Promise<boolean> {
    return this.sendSMS({
      to,
      template: 'emergencyAlert',
      data: { alert_type, location }
    });
  }

  async sendPaymentNotification(to: string, name: string, amount: string, success: boolean): Promise<boolean> {
    return this.sendSMS({
      to,
      template: success ? 'paymentSuccess' : 'paymentFailed',
      data: { name, amount }
    });
  }

  async sendVisitorArrivalSMS(to: string, resident_name: string, visitor_name: string): Promise<boolean> {
    return this.sendSMS({
      to,
      template: 'visitorArrival',
      data: { resident_name, visitor_name }
    });
  }
}

export default new SMSService();