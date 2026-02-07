// import twilio from 'twilio';
// import { smsTemplates } from '../templates/sms.templates';

interface SMSData {
  to: string;
  template: string;
  data: any;
}

class SMSService {
  // private client: twilio.Twilio | null;
  private fromNumber: string;

  constructor() {
    // const accountSid = process.env.TWILIO_ACCOUNT_SID;
    // const authToken = process.env.TWILIO_AUTH_TOKEN;
    
    // if (accountSid && authToken && accountSid.startsWith('AC')) {
    //   this.client = twilio(accountSid, authToken);
    // } else {
    //   console.warn('Twilio credentials not configured, SMS service disabled');
    //   this.client = null;
    // }
    this.fromNumber = process.env.SENDER_PHONE_NUMBER || '+13868543060';
    console.warn('SMS service is currently disabled');
  }

  async sendSMS(smsData: SMSData): Promise<boolean> {
    console.warn('SMS service disabled, skipping SMS send');
    return false;
    // try {
    //   if (!this.client) {
    //     console.warn('SMS service not configured, skipping SMS send');
    //     return false;
    //   }
      
    //   const message = smsTemplates[smsData.template](smsData.data);
      
    //   const result = await this.client.messages.create({
    //     body: message,
    //     from: this.fromNumber,
    //     to: this.formatPhoneNumber(smsData.to),
    //   });

    //   console.log(`SMS sent successfully: ${result.sid}`);
    //   return true;
    // } catch (error) {
    //   console.error('SMS sending failed:', error);
    //   return false;
    // }
  }

  private formatPhoneNumber(phone: string): string {
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
