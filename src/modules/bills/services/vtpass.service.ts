import axios, { AxiosInstance } from 'axios';
import {
  VTpassVerifyRequest,
  VTpassVerifyResponse,
  VTpassPayRequest,
  VTpassPayResponse,
  VTpassRequeryResponse,
} from '../types/vtpass.types';

class VTpassService {
  private readonly client: AxiosInstance;

  constructor() {
    const isSandbox = process.env.VTPASS_ENV !== 'live';
    const baseURL = isSandbox
      ? 'https://sandbox.vtpass.com/api'
      : 'https://vtpass.com/api';

    console.log(`VTpass: ${baseURL}`);

    this.client = axios.create({
      baseURL,
      timeout: 60000, // VTpass sandbox can be slow
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.VTPASS_API_KEY!,
        'secret-key': process.env.VTPASS_SECRET_KEY!,
      },
    });
  }

  generateRequestId(): string {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
    const random = Math.random().toString(36).slice(2, 10);
    return `${timestamp}${random}`;
  }

  /** Verify a biller (meter, smartcard, etc.) */
  async verifyMeter(data: VTpassVerifyRequest): Promise<VTpassVerifyResponse> {
    const response = await this.client.post('/merchant-verify', {
      billersCode: data.billersCode,
      serviceID: data.serviceID,
      type: data.type,
    });
    return response.data;
  }

  /** Generic purchase (electricity, airtime, data, TV) */
  async purchase(data: VTpassPayRequest): Promise<VTpassPayResponse> {
    const payload: any = {
      request_id: data.request_id,
      serviceID: data.serviceID,
      billersCode: data.billersCode,
      variation_code: data.variation_code,
      amount: data.amount,
      phone: data.phone,
    };
    if (data.subscription_type) payload.subscription_type = data.subscription_type;
    if (data.quantity) payload.quantity = data.quantity;

    const response = await this.client.post('/pay', payload);
    return response.data;
  }

  /** Shorthand for electricity */
  async purchaseElectricity(data: VTpassPayRequest): Promise<VTpassPayResponse> {
    return this.purchase(data);
  }

  /** Get variation codes for a service (data plans, TV bouquets) */
  async getVariations(serviceID: string): Promise<any> {
    const response = await this.client.get(`/service-variations?serviceID=${serviceID}`);
    return response.data;
  }

  /** Requery a transaction */
  async requeryTransaction(requestId: string): Promise<VTpassRequeryResponse> {
    const response = await this.client.post('/requery', { request_id: requestId });
    return response.data;
  }
}

export default new VTpassService();
