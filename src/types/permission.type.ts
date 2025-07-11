import { CreationAttributes } from "sequelize";
import { Permission } from "../modules/permission/permission.model";

export type PermissionCreationAttributes = CreationAttributes<Permission>;

export type PermissionUpdateAttributes = Partial<Omit<PermissionCreationAttributes, "id">>;

export type PermissionResponse = Omit<Permission, "createdAt" | "updatedAt"> & {
  roles?: string[];
};