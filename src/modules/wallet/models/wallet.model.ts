import { Table, Column, Model, DataType, ForeignKey, Default, PrimaryKey, Unique } from 'sequelize-typescript';
import { User } from '../../auth/models/user.model';

@Table({ tableName: 'wallets', underscored: true, timestamps: true })
export class Wallet extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @Unique
  @ForeignKey(() => User)
  @Column(DataType.UUID)
  declare user_id: string;

  @Default(0)
  @Column(DataType.DECIMAL(12, 2))
  declare balance: number;

  @Default('NGN')
  @Column(DataType.STRING)
  declare currency: string;

  @Default(true)
  @Column(DataType.BOOLEAN)
  declare is_active: boolean;

  @Column({ type: DataType.STRING, allowNull: true })
  declare kuda_account_number: string | null;

  @Column({ type: DataType.STRING, allowNull: true })
  declare kuda_account_name: string | null;

  @Column({ type: DataType.STRING, allowNull: true })
  declare kuda_tracking_reference: string | null;
}

@Table({ tableName: 'wallet_transactions', underscored: true, timestamps: true })
export class WalletTransaction extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => Wallet)
  @Column(DataType.UUID)
  declare wallet_id: string;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  declare user_id: string;

  @Column(DataType.ENUM('credit', 'debit'))
  declare type: string;

  @Column(DataType.DECIMAL(12, 2))
  declare amount: number;

  @Column(DataType.DECIMAL(12, 2))
  declare balance_before: number;

  @Column(DataType.DECIMAL(12, 2))
  declare balance_after: number;

  @Column(DataType.STRING)
  declare description: string;

  @Column(DataType.ENUM('funding', 'bill_payment', 'refund', 'transfer'))
  declare category: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare reference: string | null;

  @Column(DataType.ENUM('pending', 'success', 'failed'))
  declare status: string;
}
