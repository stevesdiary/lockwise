// ─── Disco (Distribution Company) identifiers ───

export type DiscoCode =
  | 'EKEDC' | 'IKEDC' | 'JED' | 'AEDC' | 'PHED'
  | 'EEDC' | 'KEDCO' | 'BEDC' | 'KAEDCO' | 'IBEDC';

export type MeterType = 'prepaid' | 'postpaid';

// ─── Provider contract ───

export interface MeterValidationRequest {
  meterNumber: string;
  disco: DiscoCode;
  meterType: MeterType;
}

export interface MeterValidationResult {
  valid: boolean;
  customerName?: string;
  customerAddress?: string;
  meterNumber: string;
  disco: DiscoCode;
  minimumAmount?: number;
}

export interface VendRequest {
  meterNumber: string;
  disco: DiscoCode;
  meterType: MeterType;
  amount: number;
  customerName?: string;
  requestId: string; // idempotency key
}

export interface VendResult {
  success: boolean;
  token?: string;
  units?: string;
  reference: string;
  provider: string;
  amount: number;
  disco: DiscoCode;
  meterNumber: string;
}

export interface RequeryResult {
  status: 'successful' | 'pending' | 'failed';
  token?: string;
  units?: string;
  reference: string;
}

export interface ElectricityProvider {
  name: string;
  priority: number;
  validateMeter(req: MeterValidationRequest): Promise<MeterValidationResult>;
  vend(req: VendRequest): Promise<VendResult>;
  requery(reference: string): Promise<RequeryResult>;
  isAvailable(): Promise<boolean>;
}

// ─── Transaction record ───

export type TransactionStatus = 'pending' | 'successful' | 'failed' | 'requires_requery';

export interface ElectricityTransaction {
  id: string;
  userId: string;
  estateId?: string;
  meterNumber: string;
  disco: DiscoCode;
  meterType: MeterType;
  amount: number;
  token?: string;
  units?: string;
  status: TransactionStatus;
  provider?: string;
  providerReference?: string;
  requestId: string;
  attempts: ProviderAttempt[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProviderAttempt {
  provider: string;
  status: 'success' | 'failed' | 'timeout';
  error?: string;
  reference?: string;
  attemptedAt: Date;
  durationMs: number;
}
