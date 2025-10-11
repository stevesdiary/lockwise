import { Table, Model, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './user.model';
import { Estate } from './estate.model';

export interface EmergencyAlertAttributes {
  id: string;
  estate_id: string;
  user_id: string;
  type: string;
  description: string;
  location: string;
  status: string;
  resolved_at?: Date;
  resolved_by?: string;
  created_at: Date;
  updated_at: Date;
}

export type EmergencyAlertCreationAttributes = Omit<EmergencyAlertAttributes, 'id' | 'created_at' | 'updated_at'> & {
  status?: string;
};

@Table({
  tableName: 'emergency_alerts',
  timestamps: true,
  underscored: true,
  freezeTableName: true
})
export class EmergencyAlert extends Model<EmergencyAlertAttributes, EmergencyAlertCreationAttributes> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4
  })
  declare id: string;

  @ForeignKey(() => Estate)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  declare estate_id: string;

  @BelongsTo(() => Estate)
  declare estate: Estate;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  declare user_id: string;

  @BelongsTo(() => User)
  declare user: User;

  @Column({
    type: DataType.ENUM('fire', 'medical', 'security', 'flood', 'power_outage', 'other'),
    allowNull: false
  })
  declare type: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false
  })
  declare description: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  declare location: string;

  @Column({
    type: DataType.ENUM('active', 'resolved', 'false_alarm'),
    allowNull: false,
    defaultValue: 'active'
  })
  declare status: string;

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  declare resolved_at: Date;

  @Column({
    type: DataType.UUID,
    allowNull: true
  })
  declare resolved_by: string;
}

export interface EmergencyContactAttributes {
  id: string;
  estate_id: string;
  name: string;
  type: string;
  phone: string;
  email?: string;
  address?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export type EmergencyContactCreationAttributes = Omit<EmergencyContactAttributes, 'id' | 'created_at' | 'updated_at' | 'is_active'> & {
  is_active?: boolean;
};

@Table({
  tableName: 'emergency_contacts',
  timestamps: true,
  underscored: true,
  freezeTableName: true
})
export class EmergencyContact extends Model<EmergencyContactAttributes, EmergencyContactCreationAttributes> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4
  })
  declare id: string;

  @ForeignKey(() => Estate)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  declare estate_id: string;

  @BelongsTo(() => Estate)
  declare estate: Estate;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  declare name: string;

  @Column({
    type: DataType.ENUM('fire', 'police', 'ambulance', 'hospital', 'security', 'maintenance'),
    allowNull: false
  })
  declare type: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  declare phone: string;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  declare email: string;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  declare address: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true
  })
  declare is_active: boolean;
}