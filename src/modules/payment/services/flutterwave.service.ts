import axios from 'axios';

interface FlutterwaveInitiateData {
  amount: number;
  currency: string;
  email: string;
  phone?: string;
  name?: string;
  tx_ref: string;
  redirect_url?: string;
  meta?: any;
}

interface FlutterwaveResponse {
  status: string;
  message: string;
  data: any;
}

class FlutterwaveService {
  private readonly baseURL = 'https://api.flutterwave.com/v3';
  private readonly secretKey = process.env.FLUTTERWAVE_SECRET_KEY;

  private getHeaders() {
    return {
      Authorization: `Bearer ${this.secretKey}`,
      'Content-Type': 'application/json',
    };
  }

  async initializePayment(data: FlutterwaveInitiateData): Promise<FlutterwaveResponse> {
    try {
      const response = await axios.post(
        `${this.baseURL}/payments`,
        {
          ...data,
          customizations: {
            title: 'Lockwise Payment',
            description: 'Payment for Lockwise services',
            logo: 'https://your-logo-url.com/logo.png',
          },
        },
        { headers: this.getHeaders() }
      );
      return response.data as FlutterwaveResponse;
    } catch (error: any) {
      throw new Error(`Flutterwave initialization failed: ${error.response?.data?.message || error.message}`);
    }
  }

  async verifyTransaction(transactionId: string): Promise<FlutterwaveResponse> {
    try {
      const response = await axios.get(
        `${this.baseURL}/transactions/${transactionId}/verify`,
        { headers: this.getHeaders() }
      );
      return response.data as FlutterwaveResponse;
    } catch (error: any) {
      throw new Error(`Flutterwave verification failed: ${error.response?.data?.message || error.message}`);
    }
  }

  async createPaymentPlan(data: {
    amount: number;
    name: string;
    interval: 'monthly' | 'quarterly' | 'biannually' | 'yearly';
    duration?: number;
  }): Promise<FlutterwaveResponse> {
    try {
      const response = await axios.post(
        `${this.baseURL}/payment-plans`,
        data,
        { headers: this.getHeaders() }
      );
      return response.data as FlutterwaveResponse;
    } catch (error: any) {
      throw new Error(`Flutterwave plan creation failed: ${error.response?.data?.message || error.message}`);
    }
  }
}

export default new FlutterwaveService();
