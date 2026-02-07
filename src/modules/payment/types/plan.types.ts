export interface PlanFeatures {
  max_residents?: number;
  max_units?: number;
  access_codes?: boolean;
  nfc_cards?: boolean;
  analytics?: boolean;
  support_level?: string;
  [key: string]: any;
}

export interface PlanAttributes {
  plan_id: number;
  plan_name: string;
  price: number;
  billing_cycle: string;
  features?: PlanFeatures;
  created_at?: Date;
  updated_at?: Date;
}

export interface PlanCreationAttributes extends Omit<PlanAttributes, 'plan_id' | 'created_at' | 'updated_at'> {}
