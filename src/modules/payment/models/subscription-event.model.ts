import { Column, Table, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Subscription } from './subscription.model';
import { Estate } from '../../estate/models/estate.model';

export type SubscriptionEventType =
  | 'trial_started'
  | 'trial_ending_soon'
  | 'trial_ended'
  | 'plan_selected'
  | 'payment_successful'
  | 'payment_failed'
  | 'subscription_activated'
  | 'subscription_renewed'
  | 'subscription_upgraded'
  | 'subscription_downgraded'
  | 'grace_period_started'
  | 'grace_period_ending'
  | 'grace_period_ended'
  | 'subscription_lapsed'
  | 'subscription_suspended'
  | 'subscription_cancelled'
  | 'features_restricted'
  | 'features_restored';

export type SubscriptionState = 'TRIAL' | 'ACTIVE' | 'GRACE' | 'LAPSED';

@Table({
  tableName: 'subscription_events',
  timestamps: true,
  underscored: true,
  freezeTableName: true
})
export class SubscriptionEvent extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
    allowNull: false
  })
  declare id: string;

  @ForeignKey(() => Subscription)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  declare subscription_id: string;

  @ForeignKey(() => Estate)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  declare estate_id: string;

  @Column({
    type: DataType.ENUM(
      'trial_started',
      'trial_ending_soon',
      'trial_ended',
      'plan_selected',
      'payment_successful',
      'payment_failed',
      'subscription_activated',
      'subscription_renewed',
      'subscription_upgraded',
      'subscription_downgraded',
      'grace_period_started',
      'grace_period_ending',
      'grace_period_ended',
      'subscription_lapsed',
      'subscription_suspended',
      'subscription_cancelled',
      'features_restricted',
      'features_restored'
    ),
    allowNull: false
  })
  declare event_type: SubscriptionEventType;

  @Column({
    type: DataType.ENUM('TRIAL', 'ACTIVE', 'GRACE', 'LAPSED'),
    allowNull: true
  })
  declare previous_state: SubscriptionState | null;

  @Column({
    type: DataType.ENUM('TRIAL', 'ACTIVE', 'GRACE', 'LAPSED'),
    allowNull: true
  })
  declare new_state: SubscriptionState | null;

  @Column({
    type: DataType.TEXT,
    allowNull: true
  })
  declare trigger_reason: string | null;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    defaultValue: {}
  })
  declare metadata: Record<string, any>;

  @BelongsTo(() => Subscription)
  declare subscription: Subscription;

  @BelongsTo(() => Estate)
  declare estate: Estate;
}
