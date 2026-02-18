import { Table, Model, Column, DataType, BelongsTo, HasMany, ForeignKey, HasOne } from 'sequelize-typescript';
import { Estate } from '../../estate/models/estate.model';
import { Role } from '../../auth/models/role.model';
import { Resident } from '../../estate/models/resident.model';
import { Payment } from '../../payment/models/payment.model';

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
  declare id: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
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
    type: DataType.STRING,
    allowNull: true,
  })
  declare google_id: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false
  })
  declare oauth_enabled: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false
  })
  declare verified: boolean;
  
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare reset_token: string | null;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare reset_expires: Date | null;
  
  @Column({
    type: DataType.ENUM('active', 'inactive', 'suspended', 'pending'),
    allowNull: false,
    defaultValue: 'pending'
  })
  declare status: string;

  @Column({
    type: DataType.ENUM('resident', 'security', 'manager', 'admin'),
    allowNull: false,
    defaultValue: 'resident'
  })
  declare user_type: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare profile_picture: string | null;

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
    foreignKey: 'user_id', 
    as: 'residentProfile' 
  })
  declare residentProfile: Resident;

  @HasMany(() => Payment)
  declare payments: Payment[];
}
