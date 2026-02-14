export interface PermissionAttributes {
  permission_id: number;
  permission: string;
  description?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface PermissionCreationAttributes extends Omit<PermissionAttributes, 'permission_id' | 'created_at' | 'updated_at'> {}
