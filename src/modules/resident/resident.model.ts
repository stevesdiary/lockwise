import { Table, Model, Column, DataType, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { Estate } from '../estate/estate.model';

@Table
export class Resident extends Model<Resident> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  declare id: number;

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

  @ForeignKey(() => Estate)
  @Column({
    type: DataType.STRING(8),
    allowNull: false,
  })
  declare estate_id: string;

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
    type: DataType.BOOLEAN,
  })
  declare subscribed: boolean;

  @BelongsTo(() => Estate)
  declare estate: Estate;


}
