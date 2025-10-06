import { Table, Model, Column, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { User } from './user.model';

export interface SupportTicketAttributes {
  id: string;
  user_id: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  assigned_to?: string;
  resolved_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export type SupportTicketCreationAttributes = Omit<SupportTicketAttributes, 'id' | 'created_at' | 'updated_at' | 'status'> & {
  status?: string;
};

@Table({
  tableName: 'support_tickets',
  timestamps: true,
  underscored: true,
  freezeTableName: true
})
export class SupportTicket extends Model<SupportTicketAttributes, SupportTicketCreationAttributes> {
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

  @BelongsTo(() => User, { as: 'user' })
  declare user: User;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  declare subject: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false
  })
  declare description: string;

  @Column({
    type: DataType.ENUM('technical', 'billing', 'access', 'general'),
    allowNull: false
  })
  declare category: string;

  @Column({
    type: DataType.ENUM('low', 'medium', 'high', 'urgent'),
    allowNull: false,
    defaultValue: 'medium'
  })
  declare priority: string;

  @Column({
    type: DataType.ENUM('open', 'in_progress', 'resolved', 'closed'),
    allowNull: false,
    defaultValue: 'open'
  })
  declare status: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: true
  })
  declare assigned_to: string;

  @BelongsTo(() => User, { as: 'assignee' })
  declare assignee: User;

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  declare resolved_at: Date;

  @HasMany(() => SupportMessage, { foreignKey: 'ticket_id' })
  declare messages: SupportMessage[];
}

export interface SupportMessageAttributes {
  id: string;
  ticket_id: string;
  user_id: string;
  message: string;
  is_internal: boolean;
  created_at: Date;
  updated_at: Date;
}

export type SupportMessageCreationAttributes = Omit<SupportMessageAttributes, 'id' | 'created_at' | 'updated_at'>;

@Table({
  tableName: 'support_messages',
  timestamps: true,
  underscored: true,
  freezeTableName: true
})
export class SupportMessage extends Model<SupportMessageAttributes, SupportMessageCreationAttributes> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4
  })
  declare id: string;

  @ForeignKey(() => SupportTicket)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  declare ticket_id: string;

  @BelongsTo(() => SupportTicket)
  declare ticket: SupportTicket;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  declare user_id: string;

  @BelongsTo(() => User)
  declare user: User;

  @Column({
    type: DataType.TEXT,
    allowNull: false
  })
  declare message: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false
  })
  declare is_internal: boolean;
}