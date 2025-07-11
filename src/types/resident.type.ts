import { Optional } from "sequelize";

export interface ResidentAttributes {
  id: string;
  title?: string; // Optional, can be null
  estate_id: string;
  first_name: string;
  last_name: string;
  email: string;
  password?: string; // Optional for residents, as they may not have a password
  verified?: boolean;
  subscribed?: boolean; // Optional, default is false
  role?: string; // Optional, default is "resident"
  profile_picture?: string; // Optional, can be null
  phone_number?: string;
  address?: string;
  created_at?: Date;
  updated_at?: Date;
}

export type ResidentCreationAttributes = Optional<ResidentAttributes, "id" | "created_at" | "updated_at">;