import { Table, Column, PrimaryKey, ForeignKey, DataType, Model, BelongsToMany  } from "sequelize-typescript";

import { Role } from "../models/role.model";
import { RolePermission } from "./role.permission.model";

@Table({
  tableName: 'permissions',
  timestamps: true,
  underscored: true,
  freezeTableName: true,
})

export class Permission extends Model {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
  })
  declare id: string;

  @ForeignKey(() => Role)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare role_id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare action: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare description: string;

  @BelongsToMany(() => Role, () => RolePermission)
  declare roles: Role[];
}
