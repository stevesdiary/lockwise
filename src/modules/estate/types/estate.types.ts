export interface EstateAttributes {
  estate_id: number;
  estate_name: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
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
