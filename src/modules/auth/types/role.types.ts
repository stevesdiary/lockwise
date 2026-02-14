export interface RoleAttributes {
  role_id: number;
  role: string;
  description?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface RoleCreationAttributes extends Omit<RoleAttributes, 'role_id' | 'created_at' | 'updated_at'> {}
