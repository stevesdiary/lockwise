import { Table, Column, Model, DataType, ForeignKey, Default, PrimaryKey, Unique, BelongsTo } from 'sequelize-typescript';
import { Estate } from '../../estate/models/estate.model';

@Table({ tableName: 'estate_wallets', underscored: true, timestamps: true })
export class EstateWallet extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @Unique
  @ForeignKey(() => Estate)
  @Column(DataType.UUID)
  declare estate_id: string;

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

  @BelongsTo(() => Estate)
  declare estate: Estate;
}

@Table({ tableName: 'estate_wallet_transactions', underscored: true, timestamps: true })
export class EstateWalletTransaction extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => EstateWallet)
  @Column(DataType.UUID)
  declare estate_wallet_id: string;

  @ForeignKey(() => Estate)
  @Column({ type: DataType.UUID, allowNull: true })
  declare estate_id: string | null;

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

  @Column(DataType.ENUM('funding', 'subscription', 'refund'))
  declare category: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare reference: string | null;

  @Column(DataType.ENUM('pending', 'success', 'failed'))
  declare status: string;

  @BelongsTo(() => EstateWallet)
  declare wallet: EstateWallet;
}
