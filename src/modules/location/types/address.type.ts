export interface AddressAttributes {
  address_id: string;
  estate_id: string;
  street?: string;
  building?: string;
  apartment_number: string;
  city?: string;
  state?: string;
  country?: string;
  zip_code?: string;
  available?: boolean;
  latitude?: number;
  longitude?: number;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export type AddressCreationAttributes = Omit<AddressAttributes, 'address_id' | 'created_at' | 'updated_at' | 'deleted_at'>;