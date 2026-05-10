import { Table, Column, Model, DataType, ForeignKey, BelongsTo, Default, PrimaryKey } from 'sequelize-typescript';
import { Estate } from '../../estate/models/estate.model';
import { User } from '../../auth/models/user.model';

@Table({ tableName: 'estate_fees', underscored: true, timestamps: true })
export class EstateFee extends Model {
  @PrimaryKey @Default(DataType.UUIDV4) @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => Estate) @Column(DataType.UUID)
  declare estate_id: string;

  @Column(DataType.STRING)
  declare name: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare description: string | null;

  @Column(DataType.DECIMAL(12, 2))
  declare amount: number;

  @Column(DataType.ENUM('monthly', 'quarterly', 'annually', 'one_time'))
  declare frequency: string;

  @Default(1) @Column(DataType.INTEGER)
  declare due_day: number;

  @Default(true) @Column(DataType.BOOLEAN)
  declare is_mandatory: boolean;

  @Default(true) @Column(DataType.BOOLEAN)
  declare is_active: boolean;

  @Default(7) @Column(DataType.INTEGER)
  declare grace_period_days: number;

  @Default(0) @Column(DataType.DECIMAL(12, 2))
  declare penalty_amount: number;

  @ForeignKey(() => User) @Column(DataType.UUID)
  declare created_by: string;

  @BelongsTo(() => Estate) declare estate: Estate;
  @BelongsTo(() => User) declare creator: User;
}

@Table({ tableName: 'estate_invoices', underscored: true, timestamps: true })
export class EstateInvoice extends Model {
  @PrimaryKey @Default(DataType.UUIDV4) @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => Estate) @Column(DataType.UUID)
  declare estate_id: string;

  @ForeignKey(() => EstateFee) @Column(DataType.UUID)
  declare fee_id: string;

  @ForeignKey(() => User) @Column(DataType.UUID)
  declare user_id: string;

  @Column(DataType.DECIMAL(12, 2))
  declare amount: number;

  @Default(0) @Column(DataType.DECIMAL(12, 2))
  declare penalty_applied: number;

  @Column(DataType.DATEONLY)
  declare due_date: string;

  @Default('pending') @Column(DataType.ENUM('pending', 'paid', 'overdue', 'waived'))
  declare status: string;

  @Column({ type: DataType.DATE, allowNull: true })
  declare paid_at: Date | null;

  @Column({ type: DataType.STRING, allowNull: true })
  declare payment_reference: string | null;

  @Column(DataType.STRING)
  declare billing_period: string;

  @BelongsTo(() => Estate) declare estate: Estate;
  @BelongsTo(() => EstateFee) declare fee: EstateFee;
  @BelongsTo(() => User) declare user: User;
}

@Table({ tableName: 'estate_withdrawals', underscored: true, timestamps: true })
export class EstateWithdrawal extends Model {
  @PrimaryKey @Default(DataType.UUIDV4) @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => Estate) @Column(DataType.UUID)
  declare estate_id: string;

  @Column(DataType.DECIMAL(12, 2))
  declare amount: number;

  @Column(DataType.STRING)
  declare bank_code: string;

  @Column(DataType.STRING)
  declare account_number: string;

  @Column(DataType.STRING)
  declare account_name: string;

  @Default('pending') @Column(DataType.ENUM('pending', 'processing', 'completed', 'failed'))
  declare status: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare transfer_reference: string | null;

  @Column({ type: DataType.STRING, allowNull: true })
  declare failure_reason: string | null;

  @ForeignKey(() => User) @Column(DataType.UUID)
  declare requested_by: string;

  @BelongsTo(() => Estate) declare estate: Estate;
  @BelongsTo(() => User, 'requested_by') declare requester: User;
}
