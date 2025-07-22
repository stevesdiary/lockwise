import { Optional } from 'sequelize';

export interface ReferrerAttributes {
  id?: string;
  referral_code: string;
  name: string;
  phone?: string;
  email: string;
  total_earnings: number;
}

export type ReferrerCreationAttributes = Optional<ReferrerAttributes, 'total_earnings' | 'phone' | 'referral_code'>;
