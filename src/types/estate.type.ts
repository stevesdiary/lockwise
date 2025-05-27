import { Optional } from 'sequelize';
import { Estate } from '../modules/estate/estate.model';

export interface EstateAttributes {
  estate_id?: string;
  name: string;
  address: string;
  type: string;
  city: string;
  state: string;
  country: string;
  estate_code: string;
  invitation_code?: string;
  number_of_apartments?: number;
  total_number_of_floors?: number;
}

export interface EstateCreationAttributes extends Optional<EstateAttributes, 'estate_id'> {}

export interface EstateUpdateAttributes extends Optional<EstateAttributes, 'estate_id' | 'invitation_code'> {}
export interface EstateResponse {
  estate_id: string;
  name: string;
  address: string;
  type: string;
  city: string;
  state: string;
  country: string;
  estate_code: string;
  invitation_code?: string;
  number_of_apartments?: number;
  total_number_of_floors?: number;
}

export interface EstateListResponse {
  estates: EstateResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiResponse {
  statusCode: number;
  status: string;
  message: string;
  data?: EstateResponse | EstateListResponse | Estate | Estate[] | null;
  error?: string;
}