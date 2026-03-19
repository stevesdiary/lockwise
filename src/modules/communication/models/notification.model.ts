import { Table, Model, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from '../../auth';

export interface NotificationAttributes {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  data?: any;
  is_read: boolean;
  sent_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export type NotificationCreationAttributes = Omit<NotificationAttributes, 'id' | 'created_at' | 'updated_at'>;

@Table({
  tableName: 'notifications',
  timestamps: true,
  underscored: true,
  freezeTableName: true
})
export class Notification extends Model<NotificationAttributes, NotificationCreationAttributes> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4
  })
  declare id: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  declare user_id: string;

  @BelongsTo(() => User)
  declare user: User;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  declare title: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false
  })
  declare message: string;

  @Column({
    type: DataType.ENUM('access_granted', 'access_denied', 'visitor_arrival', 'system_alert', 'payment_reminder'),
    allowNull: false
  })
  declare type: string;

  @Column({
    type: DataType.JSONB,
    allowNull: true
  })
  declare data: any;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false
  })
  declare is_read: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  declare sent_at: Date;
}