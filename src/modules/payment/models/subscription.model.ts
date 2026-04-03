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
    allowNull: false
  })
  declare paid_on: Date;

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
}
