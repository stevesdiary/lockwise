import { Table, Model, Column, DataType, BelongsToMany } from 'sequelize-typescript';

import { Permission } from '../permission/permission.model';
import { RolePermission } from '../permission/role.permission.model';

@Table({
  tableName: 'roles',
  timestamps: true,
  underscored: true,
  freezeTableName: true
})
export class Role extends Model<Role> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  declare id: string;

  @Column({
    type: DataType.ENUM('resident', 'admin', 'manager', 'security', 'super_admin'),
    allowNull: false,
  })
  declare role: string;

  @BelongsToMany(() => Permission, () => RolePermission)
  declare permissions: Permission[];
}
