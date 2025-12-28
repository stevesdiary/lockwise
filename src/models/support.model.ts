import { Table, Model, Column, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { User } from './user.model';

@Table({
  tableName: 'support_tickets',
  timestamps: true,
  underscored: true
})
export class SupportTicket extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4
  })
  declare id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  declare user_id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID })
  declare assigned_agent_id: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare subject: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare description: string;

  @Column({
    type: DataType.ENUM('open', 'in_progress', 'resolved', 'closed'),
    defaultValue: 'open'
  })
  declare status: string;

  @Column({
    type: DataType.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium'
  })
  declare priority: string;

  @Column({
    type: DataType.ENUM('technical', 'billing', 'access', 'general'),
    defaultValue: 'general'
  })
  declare category: string;

  @BelongsTo(() => User, 'user_id')
  declare user: User;

  @BelongsTo(() => User, 'assigned_agent_id')
  declare agent: User;

  @HasMany(() => SupportMessage)
  declare messages: SupportMessage[];
}

@Table({
  tableName: 'support_messages',
  timestamps: true,
  underscored: true
})
export class SupportMessage extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4
  })
  declare id: string;

  @ForeignKey(() => SupportTicket)
  @Column({ type: DataType.UUID, allowNull: false })
  declare ticket_id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  declare sender_id: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare message: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  declare is_internal: boolean;

  @BelongsTo(() => SupportTicket)
  declare ticket: SupportTicket;

  @BelongsTo(() => User)
  declare sender: User;
}