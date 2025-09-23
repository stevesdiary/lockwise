import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from '../user/user.model';
import { Estate } from '../estate/estate.model';

@Table({
  tableName: 'access_logs',
  timestamps: true,
  underscored: true
})
export class AccessLog extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4
  })
  declare id: string;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  declare user_id: string;

  @ForeignKey(() => Estate)
  @Column(DataType.UUID)
  declare estate_id: string;

  @Column({
    type: DataType.ENUM('entry', 'exit'),
    allowNull: false
  })
  declare action: 'entry' | 'exit';

  @Column({
    type: DataType.ENUM('success', 'denied'),
    allowNull: false
  })
  declare status: 'success' | 'denied';

  @Column(DataType.STRING)
  declare access_method: string;

  @Column(DataType.STRING)
  declare device_info: string;

  @Column(DataType.STRING)
  declare location: string;

  @BelongsTo(() => User)
  user!: User;

  @BelongsTo(() => Estate)
  estate!: Estate;
}