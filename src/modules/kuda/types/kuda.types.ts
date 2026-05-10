export class KudaNotConfiguredError extends Error {
  constructor() {
    super('Kuda API is not configured. Set KUDA_BASE_URL, KUDA_API_KEY, and KUDA_MERCHANT_KEY.');
    this.name = 'KudaNotConfiguredError';
  }
}

export class InsufficientBalanceError extends Error {
  constructor(available: number, required: number) {
    super(`Insufficient balance: available ₦${available}, required ₦${required}`);
    this.name = 'InsufficientBalanceError';
  }
}

export interface KudaCreateVirtualAccountParams {
  firstName: string;
  lastName: string;
  email: string;
  trackingReference: string;
}

export interface KudaVirtualAccountResult {
  accountNumber: string;
  accountName: string;
  trackingReference: string;
}

export interface KudaBillPaymentParams {
  amount: number;
  serviceType: string;
  customerId: string;
  narration: string;
  trackingReference: string;
}

export interface KudaBillPaymentResult {
  reference: string;
  status: 'success' | 'pending' | 'failed';
  message: string;
}

export interface KudaWebhookPayload {
  notificationCode: string;
  message: string;
  transactionData?: {
    virtualAccountNumber: string;
    trackingReference: string;
    amount: number;
    transactionReference: string;
    senderName?: string;
  };
}
