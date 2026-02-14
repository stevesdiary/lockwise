import axios from 'axios';

interface PaystackInitiateData {
  amount: number;
  email: string;
  currency?: string;
  reference?: string;
  callback_url?: string;
  metadata?: any;
}

interface PaystackResponse {
  status: boolean;
  message: string;
  data: any;
}

class PaystackService {
  private readonly baseURL = 'https://api.paystack.co';
  private readonly secretKey = process.env.PAYSTACK_SECRET_KEY;

  private getHeaders() {
    return {
      Authorization: `Bearer ${this.secretKey}`,
      'Content-Type': 'application/json',
    };
  }

  async initializeTransaction(data: PaystackInitiateData): Promise<PaystackResponse> {
    try {
      const response = await axios.post(
        `${this.baseURL}/transaction/initialize`,
        {
          ...data,
          amount: data.amount * 100,
        },
        { headers: this.getHeaders() }
      );
      return response.data as PaystackResponse;
    } catch (error: any) {
      throw new Error(`Paystack initialization failed: ${error.response?.data?.message || error.message}`);
    }
  }

  async verifyTransaction(reference: string): Promise<PaystackResponse> {
    try {
      const response = await axios.get(
        `${this.baseURL}/transaction/verify/${reference}`,
        { headers: this.getHeaders() }
      );
      return response.data as PaystackResponse;
    } catch (error: any) {
      throw new Error(`Paystack verification failed: ${error.response?.data?.message || error.message}`);
    }
  }

  async createPlan(data: {
    name: string;
    amount: number;
    interval: 'monthly' | 'quarterly' | 'biannually' | 'annually';
    description?: string;
  }): Promise<PaystackResponse> {
    try {
      const response = await axios.post(
        `${this.baseURL}/plan`,
        {
          ...data,
          amount: data.amount * 100,
        },
        { headers: this.getHeaders() }
      );
      return response.data as PaystackResponse;
    } catch (error: any) {
      throw new Error(`Paystack plan creation failed: ${error.response?.data?.message || error.message}`);
    }
  }

  async createSubscription(data: {
    customer: string;
    plan: string;
    authorization: string;
  }): Promise<PaystackResponse> {
    try {
      const response = await axios.post(
        `${this.baseURL}/subscription`,
        data,
        { headers: this.getHeaders() }
      );
      return response.data as PaystackResponse;
    } catch (error: any) {
      throw new Error(`Paystack subscription failed: ${error.response?.data?.message || error.message}`);
    }
  }
}

export default new PaystackService();
