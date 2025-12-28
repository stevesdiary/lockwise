import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  PrimaryKey
} from 'sequelize-typescript';
import { User } from './user.model';
import { Estate } from './estate.model';

export interface AccessLogAttributes {
  id: string;
  user_id: string;
  estate_id: string;
  access_code?: string;
  exit_code?: string;
  scheduled_entry_date?: Date;
  scheduled_entry_end?: Date;
  scheduled_exit_date?: Date;
  scheduled_exit_end?: Date;
  scheduled_entry_time?: string;
  scheduled_exit_time?: string;
  vehicle_number?: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  approved_by?: string;
  approved_at?: Date;
  actual_entry_time?: Date;
  actual_exit_time?: Date;
  scanned_by?: string;
  gate_id?: string;
  is_multi_entry: boolean;
  remarks?: string;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export type AccessLogCreationAttributes = Omit<AccessLogAttributes, 'id' | 'created_at' | 'updated_at'> & {
  status?: 'pending' | 'approved' | 'rejected' | 'expired';
  is_multi_entry?: boolean;
};

@Table({
  tableName: 'access_logs',
  timestamps: true,
  underscored: true,
  freezeTableName: true,
  paranoid: true
})
export class AccessLog extends Model<AccessLogAttributes, AccessLogCreationAttributes> {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false
  })
  declare id: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare user_id: string;

  @ForeignKey(() => Estate)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  declare estate_id: string;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  declare access_code: string;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  declare exit_code: string;

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  declare scheduled_entry_date: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  declare scheduled_entry_end: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  declare scheduled_exit_date: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  declare scheduled_exit_end: Date;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  declare scheduled_entry_time: string;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  declare scheduled_exit_time: string;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  declare vehicle_number: string;

  @Column({
    type: DataType.ENUM('pending', 'approved', 'rejected', 'expired'),
    allowNull: false,
    defaultValue: 'pending'
  })
  declare status: 'pending' | 'approved' | 'rejected' | 'expired';

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: true
  })
  declare approved_by: string;

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  declare approved_at: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  declare actual_entry_time: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  declare actual_exit_time: Date;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  declare scanned_by: string;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  declare gate_id: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false
  })
  declare is_multi_entry: boolean;

  @Column({
    type: DataType.TEXT,
    allowNull: true
  })
  declare remarks: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: true
  })
  declare created_by: string;

  // Relationships
  @BelongsTo(() => User, { foreignKey: 'user_id', as: 'user' })
  declare user: User;

  @BelongsTo(() => Estate, { foreignKey: 'estate_id' })
  declare estate: Estate;

  @BelongsTo(() => User, { foreignKey: 'approved_by', as: 'approver' })
  declare approver: User;

  @BelongsTo(() => User, { foreignKey: 'created_by', as: 'creator' })
  declare creator: User;

  // Helper methods
  isActive(): boolean {
    return this.actual_entry_time !== null && this.actual_exit_time === null;
  }

  canEnter(): boolean {
    return this.status === 'approved' && !this.isActive();
  }

  hasEntered(): boolean {
    return this.actual_entry_time !== null;
  }
}