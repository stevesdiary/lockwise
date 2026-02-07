import { Table, Model, Column, DataType, ForeignKey, BelongsTo, HasMany, HasOne } from 'sequelize-typescript';
import { Estate } from '../../estate/models/estate.model';
import { ParkingAssignment } from './parking-assignment.model';
import { GuestParking } from './guest-parking.model';

@Table({
  tableName: 'parking_slots',
  timestamps: true,
  underscored: true,
  freezeTableName: true
})
export class ParkingSlot extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4
  })
  declare id: string;

  @ForeignKey(() => Estate)
  @Column(DataType.UUID)
  declare estate_id: string;

  @BelongsTo(() => Estate)
  declare estate: Estate;

  @Column({
    type: DataType.STRING(20),
    allowNull: false
  })
  declare slot_number: string;

  @Column({
    type: DataType.STRING(20),
    defaultValue: 'regular'
  })
  declare slot_type: string;

  @Column(DataType.STRING(100))
  declare location: string;

  @Column({
    type: DataType.STRING(20),
    defaultValue: 'available'
  })
  declare status: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false
  })
  declare has_ev_charger: boolean;

  @Column(DataType.STRING(20))
  declare charger_type: string;

  @Column(DataType.INTEGER)
  declare charger_power: number;

  @HasOne(() => ParkingAssignment)
  declare assignment: ParkingAssignment;

  @HasMany(() => GuestParking)
  declare guestParkings: GuestParking[];
}
