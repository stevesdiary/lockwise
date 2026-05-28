import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';
import {
  KudaNotConfiguredError,
  KudaCreateVirtualAccountParams,
  KudaVirtualAccountResult,
  KudaBillPaymentParams,
  KudaBillPaymentResult,
} from '../types/kuda.types';

class KudaService {
  private getClient(): AxiosInstance {
    if (!process.env.KUDA_API_KEY || !process.env.KUDA_BASE_URL || !process.env.KUDA_MERCHANT_KEY) {
      throw new KudaNotConfiguredError();
    }
    return axios.create({
      baseURL: process.env.KUDA_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.KUDA_API_KEY}`,
      },
    });
  }

  async createVirtualAccount(params: KudaCreateVirtualAccountParams): Promise<KudaVirtualAccountResult> {
    const client = this.getClient();
    const response = await client.post('/Account/CreateVirtualAccount', {
      merchantKey: process.env.KUDA_MERCHANT_KEY,
      firstName: params.firstName,
      lastName: params.lastName,
      email: params.email,
      trackingReference: params.trackingReference,
    });
    const data = response.data?.data;
    return {
      accountNumber: data.accountNumber,
      accountName: data.accountName,
      trackingReference: params.trackingReference,
    };
  }

  async billPayment(params: KudaBillPaymentParams): Promise<KudaBillPaymentResult> {
    const client = this.getClient();
    const response = await client.post('/BillsPayment/PurchaseBill', {
      merchantKey: process.env.KUDA_MERCHANT_KEY,
      amount: params.amount,
      billType: params.serviceType,
      customerId: params.customerId,
      narration: params.narration,
      trackingReference: params.trackingReference,
    });
    const data = response.data?.data;
    return {
      reference: data?.reference || params.trackingReference,
      status: response.data?.status ? 'success' : 'failed',
      message: response.data?.message || '',
    };
  }

  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    const secret = process.env.KUDA_WEBHOOK_SECRET;
    if (!secret) return false;
    try {
      const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
      return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
    } catch {
      return false;
    }
  }
}

export const kudaService = new KudaService();
export default kudaService;
