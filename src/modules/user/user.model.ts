import { Table, Model, Column, DataType, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { Estate } from '../estate/estate.model';
import { Role } from '../role/role.model';

@Table
export class User extends Model<User> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  declare id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare first_name: string;
  
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare last_name: string;

  @ForeignKey(() => Estate)
  @Column({
    type: DataType.STRING(8),
    allowNull: false,
  })
  declare estate_id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare password: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false
  })
  declare verified: boolean;

  @BelongsTo(() => Estate)
  declare estate: Estate;

  @ForeignKey(() => Role)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare roleId: string;

  @BelongsTo(() => Role)
  declare role: Role;
}
