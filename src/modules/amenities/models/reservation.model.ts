import { Table, Model, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Amenity } from './amenity.model';
import { User } from '../../auth';

@Table({
  tableName: 'reservations',
  timestamps: true,
  underscored: true,
  freezeTableName: true
})
export class Reservation extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4
  })
  declare id: string;

  @ForeignKey(() => Amenity)
  @Column(DataType.UUID)
  declare amenity_id: string;

  @BelongsTo(() => Amenity)
  declare amenity: Amenity;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  declare user_id: string;

  @BelongsTo(() => User)
  declare user: User;

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
    defaultValue: 'pending'
  })
  declare status: string;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 1
  })
  declare guests_count: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    defaultValue: 0
  })
  declare total_amount: number;

  @Column({
    type: DataType.STRING(20),
    defaultValue: 'unpaid'
  })
  declare payment_status: string;

  @Column(DataType.TEXT)
  declare notes: string;

  @Column(DataType.TEXT)
  declare cancelled_reason: string;
}
