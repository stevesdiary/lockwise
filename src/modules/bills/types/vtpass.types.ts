export interface VTpassVerifyRequest {
  billersCode: string;
  serviceID: string;
  type?: string;
}

export interface VTpassVerifyResponse {
  code: string;
  content: {
    Customer_Name?: string;
    Meter_Number?: string;
    Address?: string;
    Customer_District?: string;
    Current_Bouquet?: string;
    Current_Bouquet_Code?: string;
    Due_Date?: string;
    Renewal_Amount?: number;
    [key: string]: any;
  };
}

export interface VTpassPayRequest {
  request_id: string;
  serviceID: string;
  billersCode: string;
  variation_code: string;
  amount: number;
  phone: string;
  subscription_type?: string;
  quantity?: number;
}

export interface VTpassPayResponse {
  code: string;
  content: {
    transactions: {
      status: string;
      product_name: string;
      unique_element: string;
      unit_price: number;
      quantity: number;
      service_verification: any;
      channel: string;
      commission: number;
      total_amount: number;
      discount: number | null;
      type: string;
      email: string;
      phone: string;
      name: string | null;
      convinience_fee: number;
      amount: number;
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

export interface VTpassWebhookPayload {
  data: {
    request_id: string;
    status: string;
    amount: string;
    product_name: string;
    unique_element: string;
    commission: number;
    total_amount: number;
    type: string;
    transactionId: string;
    purchased_code?: string;
  };
}

export interface VTpassRequeryResponse {
  code: string;
  content: {
    transactions: {
      status: string;
      product_name: string;
      unique_element: string;
      unit_price: number;
      quantity: number;
      service_verification: any;
      channel: string;
      commission: number;
      total_amount: number;
      discount: number | null;
      type: string;
      email: string;
      phone: string;
      name: string | null;
      convinience_fee: number;
      amount: number;
      platform: string;
      method: string;
      transactionId: string;
    };
  };
  response_description: string;
  requestId: string;
  amount: string;
  purchased_code: string;
}

// Electricity providers
export const ELECTRICITY_PROVIDERS = {
  'ikeja-electric': 'IKEDC - Ikeja Electric',
  'eko-electric': 'EKEDC - Eko Electric',
  'kano-electric': 'KEDCO - Kano Electric',
  'portharcourt-electric': 'PHED - Port Harcourt Electric',
  'jos-electric': 'JED - Jos Electric',
  'ibadan-electric': 'IBEDC - Ibadan Electric',
  'kaduna-electric': 'KAEDCO - Kaduna Electric',
  'abuja-electric': 'AEDC - Abuja Electric',
  'enugu-electric': 'EEDC - Enugu Electric',
  'benin-electric': 'BEDC - Benin Electric',
} as const;

// Airtime providers
export const AIRTIME_PROVIDERS = {
  'mtn': 'MTN',
  'glo': 'GLO',
  'airtel': 'Airtel',
  'etisalat': '9mobile',
} as const;

// Data providers
export const DATA_PROVIDERS = {
  'mtn-data': 'MTN Data',
  'glo-data': 'GLO Data',
  'airtel-data': 'Airtel Data',
  'etisalat-data': '9mobile Data',
} as const;

// TV providers
export const TV_PROVIDERS = {
  'dstv': 'DSTV',
  'gotv': 'GOtv',
  'startimes': 'Startimes',
  'showmax': 'Showmax',
} as const;

export type ElectricityProvider = keyof typeof ELECTRICITY_PROVIDERS;
export type AirtimeProvider = keyof typeof AIRTIME_PROVIDERS;
export type DataProvider = keyof typeof DATA_PROVIDERS;
export type TVProvider = keyof typeof TV_PROVIDERS;
