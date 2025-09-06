import { CreationAttributes } from "sequelize";
import { Role } from "../models/role.model";

export type RoleCreationAttributes = CreationAttributes<Role>;

export type RoleUpdateAttributes = Partial<Omit<RoleCreationAttributes, "id">>;

export type RoleResponse = Omit<Role, "createdAt" | "updatedAt"> & {
  permissions?: string[];
};
export type RoleListResponse = {
  roles: RoleResponse[];
  total: number;
  page: number;
  limit: number;
};