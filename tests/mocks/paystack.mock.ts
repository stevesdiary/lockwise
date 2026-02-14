import { nanoid } from 'nanoid';

/**
 * Mock Paystack service for testing payment integrations
 */

export interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    status: 'success' | 'failed' | 'abandoned';
    reference: string;
    amount: number;
    message: string | null;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: any;
    customer: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      phone: string | null;
    };
  };
}

/**
 * Creates a successful payment initialization response
 * @param reference - Payment reference
 * @returns Mock Paystack initialize response
 */
export const createSuccessfulInitializeResponse = (
  reference?: string
): PaystackInitializeResponse => {
  const ref = reference || `LW_${nanoid(10)}_${Date.now()}`;

  return {
    status: true,
    message: 'Authorization URL created',
    data: {
      authorization_url: `https://checkout.paystack.com/test_${nanoid(20)}`,
      access_code: `test_access_code_${nanoid(15)}`,
      reference: ref,
    },
  };
};

/**
 * Creates a failed payment initialization response
 * @param message - Error message
 * @returns Mock Paystack error response
 */
export const createFailedInitializeResponse = (message?: string) => {
  return {
    status: false,
    message: message || 'Payment initialization failed',
    data: null,
  };
};

/**
 * Creates a successful payment verification response
 * @param reference - Payment reference
 * @param amount - Payment amount in kobo
 * @param status - Payment status
 * @returns Mock Paystack verify response
 */
export const createSuccessfulVerifyResponse = (
  reference: string,
  amount: number = 5000000,
  status: 'success' | 'failed' | 'abandoned' = 'success'
): PaystackVerifyResponse => {
  return {
    status: true,
    message: 'Verification successful',
    data: {
      id: Math.floor(Math.random() * 1000000),
      domain: 'test',
      status,
      reference,
      amount,
      message: null,
      gateway_response: status === 'success' ? 'Successful' : 'Failed',
      paid_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      channel: 'card',
      currency: 'NGN',
      ip_address: '127.0.0.1',
      metadata: {},
      customer: {
        id: Math.floor(Math.random() * 10000),
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com',
        phone: null,
      },
    },
  };
};

/**
 * Creates a failed payment verification response
 * @param message - Error message
 * @returns Mock Paystack error response
 */
export const createFailedVerifyResponse = (message?: string) => {
  return {
    status: false,
    message: message || 'Verification failed',
    data: null,
  };
};

/**
 * Mock Paystack Service class
 */
class PaystackServiceMock {
  /**
   * Initializes a payment transaction
   */
  async initializeTransaction(params: {
    email: string;
    amount: number;
    reference?: string;
    callback_url?: string;
    metadata?: any;
  }): Promise<PaystackInitializeResponse> {
    // Simulate successful initialization
    return createSuccessfulInitializeResponse(params.reference);
  }

  /**
   * Verifies a payment transaction
   */
  async verifyTransaction(reference: string): Promise<PaystackVerifyResponse> {
    // Simulate successful verification
    return createSuccessfulVerifyResponse(reference, 5000000, 'success');
  }

  /**
   * Creates a plan
   */
  async createPlan(params: {
    name: string;
    amount: number;
    interval: string;
  }): Promise<any> {
    return {
      status: true,
      message: 'Plan created successfully',
      data: {
        id: Math.floor(Math.random() * 100000),
        plan_code: `PLN_${nanoid(10)}`,
        name: params.name,
        amount: params.amount,
        interval: params.interval,
      },
    };
  }

  /**
   * Creates a subscription
   */
  async createSubscription(params: {
    customer: string;
    plan: string;
    authorization: string;
  }): Promise<any> {
    return {
      status: true,
      message: 'Subscription created successfully',
      data: {
        subscription_code: `SUB_${nanoid(10)}`,
        email_token: `test_email_token_${nanoid(10)}`,
      },
    };
  }

  /**
   * Lists all transactions
   */
  async listTransactions(params?: {
    perPage?: number;
    page?: number;
  }): Promise<any> {
    return {
      status: true,
      message: 'Transactions retrieved',
      data: [],
      meta: {
        total: 0,
        skipped: 0,
        perPage: params?.perPage || 50,
        page: params?.page || 1,
        pageCount: 0,
      },
    };
  }
}

// Export mock instance
export const paystackServiceMock = new PaystackServiceMock();

// Export mock functions
export const mockPaystackService = {
  initializeTransaction: jest.fn().mockImplementation((params: any) =>
    Promise.resolve(createSuccessfulInitializeResponse(params.reference))
  ),

  verifyTransaction: jest.fn().mockImplementation((reference: string) =>
    Promise.resolve(createSuccessfulVerifyResponse(reference, 5000000, 'success'))
  ),

  createPlan: jest.fn().mockImplementation((params: any) =>
    Promise.resolve({
      status: true,
      message: 'Plan created successfully',
      data: {
        id: Math.floor(Math.random() * 100000),
        plan_code: `PLN_${nanoid(10)}`,
        name: params.name,
        amount: params.amount,
        interval: params.interval,
      },
    })
  ),

  createSubscription: jest.fn().mockImplementation(() =>
    Promise.resolve({
      status: true,
      message: 'Subscription created successfully',
      data: {
        subscription_code: `SUB_${nanoid(10)}`,
        email_token: `test_email_token_${nanoid(10)}`,
      },
    })
  ),

  listTransactions: jest.fn().mockImplementation(() =>
    Promise.resolve({
      status: true,
      message: 'Transactions retrieved',
      data: [],
      meta: { total: 0, skipped: 0, perPage: 50, page: 1, pageCount: 0 },
    })
  ),
};

// Reset function for tests
export const resetPaystackMock = () => {
  Object.values(mockPaystackService).forEach((mock) => {
    if (typeof mock === 'function' && 'mockClear' in mock) {
      (mock as jest.Mock).mockClear();
    }
  });
};

export default mockPaystackService;
