import { Table, Model, Column, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { Estate } from '../../estate/models/estate.model';
import { Reservation } from './reservation.model';

@Table({
  tableName: 'amenities',
  timestamps: true,
  underscored: true,
  freezeTableName: true
})
export class Amenity extends Model {
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
    type: DataType.STRING(100),
    allowNull: false
  })
  declare name: string;

  @Column(DataType.TEXT)
  declare description: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false
  })
  declare type: string;

  @Column(DataType.INTEGER)
  declare capacity: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    defaultValue: 0
  })
  declare hourly_rate: number;

  @Column({
    type: DataType.STRING(20),
    defaultValue: 'active'
  })
  declare status: string;

  @Column(DataType.JSONB)
  declare operating_hours: object;

  @Column(DataType.TEXT)
  declare rules: string;

  @HasMany(() => Reservation)
  declare reservations: Reservation[];
}
