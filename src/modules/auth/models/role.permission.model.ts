import { Column, Table, DataType, ForeignKey, Model, PrimaryKey } from 'sequelize-typescript';
import { Permission } from '../../auth/models/permission.model';
import { Role } from '../../auth/models/role.model';

@Table({
  tableName: 'role_permissions',
  timestamps: true,
  underscored: true,
  freezeTableName: true
})

export class RolePermission extends Model {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4
  })
  declare id: string;

  @ForeignKey(() => Permission)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  declare permission_id: string;

  @ForeignKey(() => Role)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare role_id: string;
}
