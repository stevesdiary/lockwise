import { Table, Model, Column, DataType, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { Estate } from '../../estate/models/estate.model';
import { Unit } from '../../estate/models/unit.model';
import { User } from '../../auth';

@Table
export class Resident extends Model<Resident> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  declare resident_id: string;

  @Column({
    type: DataType.STRING
  })
  declare title: string; 

  @Column({
    type: DataType.BOOLEAN
  })
  declare subscribed: boolean;

  @Column({
    type: DataType.TEXT,
    allowNull: true
  })
  declare address: string;

  @ForeignKey(() => Estate)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  declare estate_id: string | null;

  @BelongsTo(() => Estate)
  declare estate: Estate;

  @ForeignKey(() => Unit)
  @Column({
    type: DataType.UUID,
    allowNull: true
  })
  declare unit_id: string | null;

  @BelongsTo(() => User)
  declare user: User;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare user_id: string;

  @BelongsTo(() => Unit, { foreignKey: 'unit_id', as: 'unit' })
  declare unit: Unit;
}
