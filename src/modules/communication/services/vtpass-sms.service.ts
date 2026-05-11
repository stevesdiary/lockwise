import axios, { AxiosInstance } from 'axios';

interface VTpassSMSResponse {
  code: string;
  content: {
    transactions: {
      status: string;
      product_name: string;
      unique_element: string;
      unit_price: number;
      quantity: number;
      service_verification: null;
      channel: string;
      commission: number;
      total_amount: number;
      discount: null;
      type: string;
      email: string;
      phone: string;
      name: null;
      convinience_fee: string;
      amount: string;
      platform: string;
      method: string;
      transactionId: string;
    };
  };
  response_description: string;
  requestId: string;
  amount: string;
  transaction_date: {
    date: string;
    timezone_type: number;
    timezone: string;
  };
  purchased_code: string;
}

class VTpassSMSService {
  private readonly client: AxiosInstance;
  private readonly isEnabled: boolean;

  constructor() {
    const isSandbox = process.env.VTPASS_ENV !== 'live';
    const baseURL = isSandbox
      ? 'https://sandbox.vtpass.com/api'
      : 'https://vtpass.com/api';

    this.isEnabled = !!(process.env.VTPASS_API_KEY && process.env.VTPASS_SECRET_KEY);

    if (!this.isEnabled) {
      console.warn('VTpass SMS not configured, service disabled');
    }

    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.VTPASS_API_KEY || '',
        'secret-key': process.env.VTPASS_SECRET_KEY || '',
      },
    });
  }

  private generateRequestId(): string {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
    const random = Math.random().toString(36).slice(2, 10);
    return `sms_${timestamp}${random}`;
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
    if (!this.isEnabled) {
      console.warn('VTpass SMS not configured. SMS not sent.');
      return false;
    }

    const formattedPhone = this.formatPhoneNumber(to);

    try {
      const response = await this.client.post<VTpassSMSResponse>('/pay', {
        request_id: this.generateRequestId(),
        serviceID: 'sms',
        phone: formattedPhone,
        message: message,
      });

      if (response.data.code === '000') {
        console.log('VTpass SMS sent successfully', {
          transactionId: response.data.content.transactions.transactionId,
          amount: response.data.amount,
        });
        return true;
      } else {
        console.error('VTpass SMS failed', {
          code: response.data.code,
          description: response.data.response_description,
        });
        return false;
      }
    } catch (error: any) {
      console.error('VTpass SMS error', {
        to: formattedPhone,
        error: error.response?.data || error.message,
      });
      return false;
    }
  }
}

export default new VTpassSMSService();
