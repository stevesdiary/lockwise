import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  UpdatedAt,
  PrimaryKey,
} from 'sequelize-typescript';
import {  Plan} from '../payment/plan.model';
import { Estate } from '../estate/estate.model';
import { User } from '../user/user.model';
import { Subscription } from './subscription.model';

type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
type PaymentMethod = 'credit_card' | 'debit_card' | 'bank_transfer' | 'cash' | 'POS';
type Currency = 'NGN' | 'USD' | 'EUR' | 'GBP';

@Table({
  tableName: 'payments',
  timestamps: true,
  paranoid: true,
  underscored: true,
  freezeTableName: true,
})
export class Payment extends Model {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false
  })
  declare id: string;

  @ForeignKey(() => Estate)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare estate_id: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  declare amount: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: 'NGN',
  })
  declare currency: Currency;

  @Column({
    type: DataType.ENUM('pending', 'completed', 'failed', 'refunded'),
    allowNull: false,
    defaultValue: 'pending',
  })
  payment_status!: PaymentStatus;
  
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  payment_provider!: string;

  @Column({
    type: DataType.ENUM('credit_card', 'debit_card', 'bank_transfer', 'cash', 'USSD', 'paypal'),
    allowNull: false,
  })
  payment_method!: PaymentMethod;

  @Column({
    type: DataType.STRING
  })
  reference!: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  payment_date!: Date;

  @Column({
    type: DataType.DECIMAL(10, 2),
  })
  refund_amount?: number;

  @Column({
    type: DataType.JSON,
  })
  payment_data?: string 

  @Column(DataType.DATE)
  refund_date?: Date;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare user_id: string;

  @ForeignKey(() => Subscription)
  @Column(DataType.UUID)
  declare subscription_id: string;
}
