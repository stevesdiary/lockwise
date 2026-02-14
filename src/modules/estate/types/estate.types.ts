export interface EstateAttributes {
  estate_id: string;
  estate_code?: string;
  name: string;
  type: string;
  city: string;
  state: string;
  country: string;
  country_code: string;
  timezone: string;
  currency_code: string;
  location_details?: {
    street_address?: string;
    area_district?: string;
    administrative_area?: string;
    postal_code?: string;
    plus_code?: string;
    digital_address?: string;
    landmark?: string;
    coordinates?: { lat: number; lng: number };
    format?: string;
  };
  access_points?: Array<{
    gate_id?: string;
    gate_name: string;
    type: string;
    is_active: boolean;
  }>;
  geo_fencing?: {
    center?: { lat: number; lng: number };
    radius_meters?: number;
  };
  total_number_of_apartments: number;
  total_floors?: number;
  total_parking_spaces?: number;
  number_of_staff?: number;
  status?: string;
  contact_info?: {
    phone?: string;
    email?: string;
    address?: string;
  };
  approval_status?: string;
  approved_on?: Date;
  approved_by?: string;
  referrer_id?: string;
  plan_id?: string;
  created_by: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface EstateCreationAttributes extends Omit<EstateAttributes, 'estate_id' | 'created_at' | 'updated_at'> {}

export interface ResidentAttributes {
  resident_id: number;
  user_id: number;
  estate_id: number;
  unit_id?: number;
  status: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface ResidentCreationAttributes extends Omit<ResidentAttributes, 'resident_id' | 'created_at' | 'updated_at'> {}
