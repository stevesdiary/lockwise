import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  PrimaryKey,
  HasMany,
  CreatedAt,
  UpdatedAt,
  DeletedAt
} from 'sequelize-typescript';
import { User } from '../models/user.model';
import { Estate } from '../models/estate.model';
import { 
  AccessAttributes, 
  AccessCreationAttributes, 
  AccessEntryAttributes, 
  AccessEntryCreationAttributes,
  AccessType, 
  VerificationMethod, 
  AccessStatus 
} from '../types/access.type';

// AccessEntry Model
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

  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false
  })
  declare created_at: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false
  })
  declare updated_at: Date;

  @DeletedAt
  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  declare deleted_at: Date;
}

// Access Model
@Table({ 
  tableName: 'accesses', 
  timestamps: true,
  freezeTableName: true,
  underscored: true,
  paranoid: true
})
export class Access extends Model<AccessAttributes, AccessCreationAttributes> {
  @PrimaryKey
  @Column({ 
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4
  })
  declare id: string;

  @ForeignKey(() => User)
  @Column({ 
    allowNull: false, 
    type: DataType.UUID 
  })
  declare user_id: string;

  @BelongsTo(() => User)
  declare user: User;

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
    allowNull: true, 
    type: DataType.TIME 
  })
  declare entry_time: string;

  @Column({ 
    allowNull: true, 
    type: DataType.TIME
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

  // Multiple entry support
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

  // Relationship with access entries
  @HasMany(() => AccessEntry, {
    foreignKey: 'access_id',
    as: 'entries'
  })
  declare entries: AccessEntry[];

  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false
  })
  declare created_at: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false
  })
  declare updated_at: Date;

  @DeletedAt
  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  declare deleted_at: Date;

  // Instance methods for multiple entry management
  public getRemainingEntries(): number {
    if (!this.is_multi_entry) return 0;
    const currentEntries = this.entries ? this.entries.length : 0;
    return Math.max(0, (this.max_entries || 1) - currentEntries);
  }

  public canEnter(): boolean {
    if (!this.is_multi_entry) {
      // For single entry, check if no entries exist yet
      return !this.entries || this.entries.length === 0;
    }
    return this.getRemainingEntries() > 0;
  }

  public hasActiveEntry(): boolean {
    if (!this.entries) return false;
    return this.entries.some(entry => entry.entry_time && !entry.exit_time);
  }
}