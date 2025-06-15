import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  PrimaryKey,
  HasMany
} from 'sequelize-typescript';
import { User } from '../user/user.model';
import { Estate } from '../estate/estate.model';


@Table({ 
  tableName: 'access_logs', 
  timestamps: true,
  freezeTableName: true,
  underscored: true,
  paranoid: true
})

export class AccessLog extends Model {
  @PrimaryKey
  @Column({ 
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4
  })
  declare id: string;

  @ForeignKey(() => User)
  @Column({ 
    allowNull: false, 
    type: DataType.UUID 
  })
  declare user_id: string;

  @BelongsTo(() => User)
  declare user: User;

  @Column({ 
    allowNull: false, 
    type: DataType.STRING(6) 
  })
  declare access_code: string;

  @Column({
    type: DataType.DATE,
    allowNull: false
  })
  declare date_in: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  declare date_out: Date;

  @Column({ 
    allowNull: true, 
    type: DataType.TIME 
  })
  declare entry_time: string;

  @Column({ 
    allowNull: true, 
    type: DataType.TIME
  })
  declare exit_time: string;

  @ForeignKey(() => Estate)
  @Column({
    allowNull: false,
    type: DataType.UUID
  })
  declare estate_id: string;

  @Column({
    type: DataType.ENUM('guest', 'resident', 'staff', 'delivery', 'maintenance', 'security', 'others'),
    allowNull: false,
    defaultValue: 'guest'
  })
  declare access_type: string;

  @Column({
    type: DataType.ENUM('RFID', 'QR_code', 'access_code', 'manual_approval'),
    allowNull: false,
    defaultValue: 'access_code'
  })
  declare verification_method: string;

  @Column({
    type: DataType.STRING
  })
  declare vehicle_number: string;

  @Column({
    type: DataType.ENUM('approved', 'pending', 'denied', 'cancelled', 'expired'),
    allowNull: false,
  })
  declare status: string;

  @Column({
    type: DataType.TEXT
  })
  declare remarks: string;
  
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare resident_id: string;

  @BelongsTo(() => User, {as: 'residents'})
  declare resident: User;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare created_by: string;

  @BelongsTo(() => Estate, {
    foreignKey: 'estate_id'
  })
  declare estate: Estate;
}
