import { Table, Model, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from '../../auth/models/user.model';
import { Estate } from '../../estate/models/estate.model';

@Table({ tableName: 'smart_meters', underscored: true })
export class SmartMeter extends Model<SmartMeter> {
  @Column({ type: DataType.UUID, primaryKey: true, defaultValue: DataType.UUIDV4 })
  declare id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  declare user_id: string;

  @ForeignKey(() => Estate)
  @Column({ type: DataType.UUID, allowNull: true })
  declare estate_id: string | null;

  @Column({ type: DataType.STRING, allowNull: false })
  declare meter_number: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare disco: string;

  @Column({ type: DataType.ENUM('prepaid', 'postpaid'), allowNull: false, defaultValue: 'prepaid' })
  declare meter_type: 'prepaid' | 'postpaid';

  @Column({ type: DataType.STRING, allowNull: true })
  declare customer_name: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare customer_address: string | null;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  declare auto_load_enabled: boolean;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  declare is_verified: boolean;

  @BelongsTo(() => User)
  declare user: User;

  @BelongsTo(() => Estate)
  declare estate: Estate;
}
