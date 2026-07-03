import vtpassSMSService from './vtpass-sms.service';

interface KudiSMSResponse {
  status: string;
  error_code: string;
  cost?: string;
  data?: string[];
  msg: string;
  length?: number;
  page?: number;
  balance?: string;
}

const KUDISMS_ERROR_MESSAGES: Record<string, string> = {
  '000': 'Message Sent Successfully',
  '009': 'You are only allowed to send maximum of 6 pages of SMS at once',
  '401': 'The request could not be completed',
  '100': 'Token provided is invalid',
  '101': 'The account has been deactivated, please contact the admin',
  '103': 'The gateway selected doesn\'t exist',
  '104': 'Blocked message keyword(s)',
  '105': 'The sender ID used has been blocked',
  '106': 'The sender ID used do not exist',
  '107': 'Please provide a valid phone number',
  '108': 'The total amount of recipients is more than the required batch size of 100',
  '109': 'You do not have enough credit balance to perform the transaction',
  '111': 'Only approved promotional Sender ID allowed',
  '114': 'No package attached to this service',
  '185': 'No route attached to this package',
  '187': 'The request could not be processed',
  '188': 'The sender ID is unapproved',
  '300': 'There are missing parameters'
};

interface SMSData {
  to: string;
  template: string;
  data: any;
}

class SMSService {
  private apiToken: string;
  private senderId: string;
  private gateway: string;
  private apiUrl = 'https://my.kudisms.net/api/sms';
  private useVTpass: boolean;

  constructor() {
    this.apiToken = process.env.KUDISMS_API_TOKEN || '';
    this.senderId = process.env.KUDISMS_SENDER_ID || 'LOCKWISE';
    this.gateway = process.env.KUDISMS_GATEWAY || '2';
    this.useVTpass = !!(process.env.VTPASS_API_KEY && process.env.VTPASS_SECRET_KEY);

    if (!this.useVTpass && !this.apiToken) {
      console.warn('No SMS provider configured, SMS service disabled');
    }
  }

  private formatPhoneNumber(phone: string): string {
    if (phone.startsWith('0')) {
      return '234' + phone.substring(1);
    }
    if (phone.startsWith('+')) {
      return phone.substring(1);
    }
    if (!phone.startsWith('234')) {
      return '234' + phone;
    }
    return phone;
  }

  async sendSMS(to: string, message: string): Promise<boolean> {
    // Try VTpass first if configured
    if (this.useVTpass) {
      const vtpassSuccess = await vtpassSMSService.sendSMS(to, message);
      if (vtpassSuccess) return true;
      
      console.warn('VTpass SMS failed, falling back to KudiSMS');
    }

    // Fallback to KudiSMS
    if (!this.apiToken) {
      console.warn('No SMS provider available. SMS not sent.');
      return false;
    }

    const formattedPhone = this.formatPhoneNumber(to);

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: this.apiToken,
          senderID: this.senderId,
          recipients: formattedPhone,
          message: message,
          gateway: this.gateway
        })
      });

      if (!response.ok) {
        throw new Error(`KudiSMS API error: ${response.statusText}`);
      }

      const result: KudiSMSResponse = await response.json();

      if (result.status === 'success' && result.error_code === '000') {
        console.log('KudiSMS sent successfully', { cost: result.cost});
        return true;
      } else {
        const errorMessage = KUDISMS_ERROR_MESSAGES[result.error_code] || result.msg || 'Unknown error';
        console.error(`KudiSMS API error: ${errorMessage} (Code: ${result.error_code})`);
        return false;
      }
    } catch (error: any) {
      console.error('Failed to send SMS via KudiSMS', { to: formattedPhone, error: error.message });
      return false;
    }
  }

  async sendVerificationSMS(to: string, name: string, code: string): Promise<boolean> {
    const message = `${name}, your LOCKWISE phone validator is: ${code}. Valid for 10 minutes.`;
    return this.sendSMS(to, message);
  }

  // async sendAccessCodeSMS(to: string, name: string, access_code: string, valid_until: string): Promise<boolean> {
  //   const message = `${name}, your LOCKWISE access code is: ${access_code}. Valid until: ${valid_until}`;
  //   return this.sendSMS(to, message);
  // }

  async sendPasswordResetSMS(to: string, name: string, code: string): Promise<boolean> {
    const message = `${name}, your LOCKWISE password reset code is: ${code}. Valid for 10 minutes.`;
    return this.sendSMS(to, message);
  }

  async sendEmergencyAlert(to: string, alert_type: string, location: string): Promise<boolean> {
    const message = `LOCKWISE EMERGENCY ALERT: ${alert_type} at ${location}. Please respond immediately.`;
    return this.sendSMS(to, message);
  }

  async sendPaymentNotification(to: string, name: string, amount: string, success: boolean): Promise<boolean> {
    const message = success 
      ? `${name}, your LOCKWISE payment of ${amount} was successful.`
      : `${name}, your LOCKWISE payment of ${amount} failed. Please try again.`;
    return this.sendSMS(to, message);
  }

  async sendVisitorArrivalSMS(to: string, resident_name: string, visitor_name: string): Promise<boolean> {
    const message = `${resident_name}, your visitor ${visitor_name} has arrived at the gate.`;
    return this.sendSMS(to, message);
  }

  async sendOTP(phone: string, otp: string): Promise<boolean> {
    const message = `LOCKWISE: ${otp} (expires in 10 min)`;
    return this.sendSMS(phone, message);
  }

  async sendNotification(phone: string, title: string, messageText: string): Promise<boolean> {
    const message = `${title}\n\n${messageText}`;
    return this.sendSMS(phone, message);
  }
}

export default new SMSService();
