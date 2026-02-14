import { Table, Model, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { ParkingSlot } from './parking-slot.model';
import { User } from '../../auth/models/user.model';
import { Payment } from '../../payment/models/payment.model';

@Table({
  tableName: 'ev_charging_sessions',
  timestamps: true,
  underscored: true,
  freezeTableName: true
})
export class EVChargingSession extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4
  })
  declare id: string;

  @ForeignKey(() => ParkingSlot)
  @Column(DataType.UUID)
  declare slot_id: string;

  @BelongsTo(() => ParkingSlot)
  declare slot: ParkingSlot;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  declare user_id: string;

  @BelongsTo(() => User)
  declare user: User;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW
  })
  declare start_time: Date;

  @Column(DataType.DATE)
  declare end_time: Date;

  @Column(DataType.DECIMAL(10, 2))
  declare energy_consumed: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    defaultValue: 50.00
  })
  declare rate_per_kwh: number;

  @Column(DataType.DECIMAL(10, 2))
  declare total_cost: number;

  @Column({
    type: DataType.STRING(20),
    defaultValue: 'pending'
  })
  declare payment_status: string;

  @ForeignKey(() => Payment)
  @Column(DataType.UUID)
  declare payment_id: string;

  @BelongsTo(() => Payment)
  declare payment: Payment;

  @Column({
    type: DataType.STRING(20),
    defaultValue: 'active'
  })
  declare status: string;
}
