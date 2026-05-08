import { Table, Model, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from '../../auth/models/user.model';
import { Estate } from '../../estate/models/estate.model';
import { SmartMeter } from './smart-meter.model';

@Table({ tableName: 'electricity_transactions', underscored: true })
export class ElectricityTransactionRecord extends Model<ElectricityTransactionRecord> {
  @Column({ type: DataType.UUID, primaryKey: true, defaultValue: DataType.UUIDV4 })
  declare id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  declare user_id: string;

  @ForeignKey(() => Estate)
  @Column({ type: DataType.UUID, allowNull: true })
  declare estate_id: string | null;

  @ForeignKey(() => SmartMeter)
  @Column({ type: DataType.UUID, allowNull: true })
  declare smart_meter_id: string | null;

  @Column({ type: DataType.STRING, allowNull: false })
  declare meter_number: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare disco: string;

  @Column({ type: DataType.ENUM('prepaid', 'postpaid'), allowNull: false })
  declare meter_type: 'prepaid' | 'postpaid';

  @Column({ type: DataType.DECIMAL(12, 2), allowNull: false })
  declare amount: number;

  @Column({ type: DataType.STRING, allowNull: true })
  declare token: string | null;

  @Column({ type: DataType.STRING, allowNull: true })
  declare units: string | null;

  @Column({ type: DataType.ENUM('pending', 'successful', 'failed', 'requires_requery'), allowNull: false, defaultValue: 'pending' })
  declare status: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare provider: string | null;

  @Column({ type: DataType.STRING, allowNull: true })
  declare provider_reference: string | null;

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  declare request_id: string;

  @Column({ type: DataType.JSONB, allowNull: false, defaultValue: [] })
  declare attempts: any[];

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  declare auto_loaded: boolean;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  declare receipt_sent: boolean;

  @BelongsTo(() => User)
  declare user: User;

  @BelongsTo(() => Estate)
  declare estate: Estate;

  @BelongsTo(() => SmartMeter)
  declare smartMeter: SmartMeter;
}
