export type DiscoCode =
  | 'EKEDC' | 'IKEDC' | 'JED' | 'AEDC' | 'PHED'
  | 'EEDC' | 'KEDCO' | 'BEDC' | 'KAEDCO' | 'IBEDC';

export type MeterType = 'prepaid' | 'postpaid';

export interface MeterValidationResult {
  valid: boolean;
  customerName?: string;
  customerAddress?: string;
  meterNumber: string;
  disco: DiscoCode;
  minimumAmount?: number;
}
