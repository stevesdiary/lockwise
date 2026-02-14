import { Table, Model, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { ParkingSlot } from './parking-slot.model';
import { User } from '../../auth/models/user.model';

@Table({
  tableName: 'parking_assignments',
  timestamps: true,
  underscored: true,
  freezeTableName: true
})
export class ParkingAssignment extends Model {
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

  @Column(DataType.STRING(20))
  declare vehicle_plate: string;

  @Column(DataType.STRING(50))
  declare vehicle_model: string;

  @Column({
    type: DataType.DATEONLY,
    defaultValue: DataType.NOW
  })
  declare assigned_date: Date;

  @Column({
    type: DataType.STRING(20),
    defaultValue: 'active'
  })
  declare status: string;
}
