import { Table, Model, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { ParkingSlot } from './parking-slot.model';
import { User } from '../../auth/models/user.model';

@Table({
  tableName: 'guest_parking',
  timestamps: true,
  underscored: true,
  freezeTableName: true
})
export class GuestParking extends Model {
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
  declare owner_id: string;

  @BelongsTo(() => User)
  declare owner: User;

  @Column({
    type: DataType.STRING(100),
    allowNull: false
  })
  declare guest_name: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: false
  })
  declare guest_phone: string;

  @Column(DataType.STRING(20))
  declare guest_vehicle_plate: string;

  @Column({
    type: DataType.DATE,
    allowNull: false
  })
  declare start_time: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false
  })
  declare end_time: Date;

  @Column({
    type: DataType.STRING(20),
    defaultValue: 'active'
  })
  declare status: string;

  @Column(DataType.STRING(10))
  declare access_code: string;
}
