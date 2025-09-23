// src/types/user.type.ts

import { CreationAttributes } from 'sequelize';
import { User } from '../models/user.model';

export type UserCreationAttributes = CreationAttributes<User>;

export type UserUpdateAttributes = Partial<Omit<UserCreationAttributes, 'id' | 'password'>>;

export type ApiResponse<T> = {
  status: 'success' | 'fail';
  statusCode: number;
  message: string;
  data: T;
};


// import { Optional } from "sequelize";
// import { User } from "../modules/user/user.model";

// export interface ResidentAttributes {
//   id: string;
//   estate_id: string;
//   first_name: string;
//   last_name: string;
//   email: string;
//   phone_number?: string;
//   address?: string;
//   created_at?: Date;
//   updated_at?: Date;
// }

// export type ResidentCreationAttributes = Optional<ResidentAttributes, "id" | "created_at" | "updated_at">;
// export type ResidentUpdateAttributes = Partial<Omit<ResidentAttributes, "id" | "created_at" | "updated_at">>; 

// export type ResidentResponse = Omit<ResidentAttributes, "created_at" | "updated_at"> & {
//   estate?: {
//     id: string;
//     name: string;
//   };
//   profile_picture?: string;
// };

// export interface UserCreationAttributes {
//   email: string;
//   password: string;
//   estate_id: string;
//   verified: boolean;
//   role: string;
// }

// export type UserUpdateAttributes = Partial<Omit<User, "id" | "createdAt" | "updatedAt">>;

// export interface ApiResponse<T = any> {
//   status: "success" | "error";
//   message: string;
//   data?: T;
//   error?: string;
//   statusCode?: number;
// }