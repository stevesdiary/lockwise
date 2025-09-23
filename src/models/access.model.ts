import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  PrimaryKey,
  HasMany
} from 'sequelize-typescript';
import { User } from './user.model';
import { Estate } from './estate.model';
import { 
  AccessAttributes, 
  AccessCreationAttributes, 
  AccessEntryAttributes, 
  AccessEntryCreationAttributes,
  AccessType, 
  VerificationMethod, 
  AccessStatus 
} from '../types/access.type';

@Table({
  tableName: 'access',
  timestamps: true,
  underscored: true,
  freezeTableName: true,
  paranoid: true
})
export class Access extends Model<AccessAttributes, AccessCreationAttributes> {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false
  })
  declare id: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare user_id: string;

  @Column({ 
    allowNull: false, 
    type: DataType.STRING(6) 
  })
  declare access_code: string;

  @Column({
    type: DataType.DATE,
    allowNull: false
  })
  declare date_in: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false
  })
  declare date_out: Date;

  @Column({
    type: DataType.STRING
  })
  declare entry_time: string;

  @Column({
    type: DataType.STRING
  })
  declare exit_time: string;

  @ForeignKey(() => Estate)
  @Column({
    allowNull: false,
    type: DataType.UUID
  })
  declare estate_id: string;

  @Column({
    type: DataType.ENUM('guest', 'resident', 'staff', 'delivery', 'maintenance', 'security', 'others'),
    allowNull: false,
    defaultValue: 'guest'
  })
  declare access_type: AccessType;

  @Column({
    type: DataType.ENUM('RFID', 'QR_code', 'access_code', 'manual_approval'),
    allowNull: false,
    defaultValue: 'access_code'
  })
  declare verification_method: VerificationMethod;

  @Column({
    type: DataType.STRING
  })
  declare vehicle_number: string;

  @Column({
    type: DataType.ENUM('approved', 'pending', 'denied', 'cancelled', 'expired'),
    allowNull: false,
  })
  declare status: AccessStatus;

  @Column({
    type: DataType.TEXT
  })
  declare remarks: string;
  
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare resident_id: string;

  @BelongsTo(() => User, {as: 'residents'})
  declare resident: User;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare created_by: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false
  })
  declare is_multi_entry: boolean;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    defaultValue: 1
  })
  declare max_entries: number;

  @BelongsTo(() => Estate, {
    foreignKey: 'estate_id'
  })
  declare estate: Estate;

  @HasMany(() => AccessEntry, {
    foreignKey: 'access_id',
    as: 'entries'
  })
  declare entries: AccessEntry[];

  @Column({
    type: DataType.DATE,
    allowNull: false
  })
  declare created_at: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false
  })
  declare updated_at: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  declare deleted_at: Date;

  getRemainingEntries(): number {
    if (!this.is_multi_entry) return this.entries?.length > 0 ? 0 : 1;
    return Math.max(0, (this.max_entries || 1) - (this.entries?.length || 0));
  }

  canEnter(): boolean {
    return this.getRemainingEntries() > 0;
  }

  hasActiveEntry(): boolean {
    return this.entries?.some(entry => entry.entry_time && !entry.exit_time) || false;
  }
}

@Table({
  tableName: 'access_entries',
  timestamps: true,
  underscored: true,
  freezeTableName: true,
  paranoid: true
})
export class AccessEntry extends Model<AccessEntryAttributes, AccessEntryCreationAttributes> {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false
  })
  declare id: string;

  @ForeignKey(() => Access)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  declare access_id: string;

  @BelongsTo(() => Access)
  declare access: Access;

  @Column({
    type: DataType.DATE,
    allowNull: false
  })
  declare entry_time: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  declare exit_time: Date;

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
    type: DataType.DATE,
    allowNull: false
  })
  declare created_at: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false
  })
  declare updated_at: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  declare deleted_at: Date;
}