export interface ReferrerAttributes {
  referrer_id: number;
  estate_id: number;
  referral_code: string;
  total_referrals?: number;
  total_earnings?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface ReferrerCreationAttributes extends Omit<ReferrerAttributes, 'referrer_id' | 'created_at' | 'updated_at'> {}
