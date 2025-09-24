export interface PaymentRequestData {
  amount: number;
  email: string;
  currency?: string;
  payment_provider: string;
  payment_method: string;
}

export interface PaymentVerificationData {
  reference: string;
}

export interface PaymentResponse {
  statusCode: number;
  status: string;
  message: string;
  data?: any;
}
