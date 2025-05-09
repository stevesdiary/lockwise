export interface PaymentRequestData {
  amount: number;
  email: string;
  currency: string;
  payment_provider?: string;
  payment_method: string;
  // user_id: string;
}

export interface FetchPaymentsRequestData {
  limitNumber?: number;
  pageNumber?: number;
}

export interface PaymentInitiationData {
  patient_id: string;
  paymentMethod?: string;
  payment_type?: string;
  amount: number;
  email: string;
  currency: string;
  appointment_id?: string;
  paymentProvider: string;
}

export interface PaymentVerificationData {
  reference: string;
}

export interface PaymentResponse {
  statusCode: number;
  status: string;
  message: string;
  data?: {
    authorization_url?: string;
    reference: string;
    appointment_id?: string;
    payment_status?: string;
  } | null
}

export interface VerificationResponseData {
  reference: string;
  status: string;
  appointment_id: string;
  amount: number;
  payment_date: Date;
  patient: {
    email: string;
  };
}
export interface AllPaymentsResponse {
  statusCode: number;
  status: string;
  message: string;
  data?: unknown;
}
