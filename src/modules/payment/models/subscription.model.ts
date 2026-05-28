import { Column, PrimaryKey, ForeignKey, Model, BelongsTo, HasMany, DataType, Table } from "sequelize-typescript";
import { Estate } from "../../estate/models/estate.model";
import { Plan } from "./plan.model";

@Table({
  tableName: 'subscriptions',
  timestamps: true,
  underscored: true,
  freezeTableName: true,
  paranoid: true
})

export class Subscription extends Model {
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
    field: 'estate_id',
    allowNull: false
  })
  declare estate_id: string;

  @ForeignKey(() => Plan)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  declare plan_id: string;

  @Column({
    type: DataType.DATE,
    allowNull: false
  })
  declare start_date: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false
  })
  declare end_date: Date;

  @Column({
    type: DataType.ENUM('active', 'inactive', 'cancelled', 'expired', 'grace_period'),
    allowNull: false
  })
  declare status: string;

  @Column({
    type: DataType.ENUM('TRIAL', 'ACTIVE', 'GRACE', 'LAPSED'),
    allowNull: false,
    defaultValue: 'TRIAL'
  })
  declare subscription_state: 'TRIAL' | 'ACTIVE' | 'GRACE' | 'LAPSED';

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  declare trial_start_date: Date | null;

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  declare trial_end_date: Date | null;

  @Column({
    type: DataType.ENUM('monthly', 'quarterly', 'annually'),
    allowNull: true
  })
  declare billing_cycle: 'monthly' | 'quarterly' | 'annually' | null;

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  declare next_billing_date: Date | null;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  declare paystack_subscription_code: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  declare paystack_customer_code: string | null;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0
  })
  declare resident_count: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true
  })
  declare resident_cap: number | null;

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  declare lapsed_start_date: Date | null;

  @Column({
    type: DataType.STRING
  })
  declare cancel_reason: string;

  @BelongsTo(() => Plan)
  declare plan: Plan;

  @BelongsTo(() => Estate)
  declare estate: Estate;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true
  })
  declare auto_renew: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  declare paid_on: Date | null;

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  declare grace_period_end_date: Date | null;

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  declare last_notification_sent: Date | null;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  })
  declare wallet_payment_enabled: boolean;
}
