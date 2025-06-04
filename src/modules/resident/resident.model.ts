import { Table, Model, Column, DataType, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { Estate } from '../estate/estate.model';
import { Unit } from '../estate/unit.model';
import { User } from '../user/user.model';

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
  declare email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare password: string;

  @Column({
    type: DataType.BOOLEAN
  })
  declare verified: boolean;

  @Column({
    type: DataType.BOOLEAN
  })
  declare subscribed: boolean;

  @ForeignKey(() => Estate)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare estate_id: string;

  @BelongsTo(() => Estate)
  declare estate: Estate;

  @ForeignKey(() => Unit)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare unit_id: string;

  @BelongsTo(() => User)
  declare user: User;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare user_id: string;

  @BelongsTo(() => Unit)
  declare unit: Unit;
}
