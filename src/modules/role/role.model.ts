import { Table, Model, Column, DataType } from 'sequelize-typescript';
import { generateId } from '../../utils/idGenerator';

@Table
export class Role extends Model<Role> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: generateId(),
  })
  declare id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare description: string;
}
