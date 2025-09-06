import { Table, Model, Column, DataType, BelongsTo, HasMany, ForeignKey, HasOne } from 'sequelize-typescript';
import { Estate } from './estate.model';
import { Role } from '../models/role.model';
import { Resident } from '../models/resident.model';
import { Access } from '../models/access.model';
import { Payment } from '../models/payment.model';

@Table({
  tableName: 'users',
  freezeTableName: true,
  underscored: true
})
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
  declare title: string;

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

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare phone: string;

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
    allowNull: false,
    defaultValue: false
  })
  declare verified: boolean;

  @ForeignKey(() => Role)
  @Column(DataType.UUID)
  declare role_id: string;

  @BelongsTo(() => Role)
  declare role: Role;

  @ForeignKey(() => Estate)
  @Column(DataType.UUID)
  declare estate_id: string;

  @BelongsTo(() => Estate)
  declare estate: Estate;

  @HasOne(() => Resident, { 
    foreignKey: 'id', 
    as: 'residentProfile' 
  })
  declare residentProfile: Resident;

  @HasMany(() => Access)
  declare Accesss: Access[];

  @HasMany(() => Payment)
  declare payments: Payment[];
}
