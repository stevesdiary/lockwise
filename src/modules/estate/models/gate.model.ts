import { Table, Model, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Estate } from './estate.model';

interface GateAttributes {
  gate_id: string;
  estate_id: string;
  gate_code: string;
  gate_name: string;
  gate_type: 'main' | 'service' | 'pedestrian' | 'emergency' | 'vip';
  is_active: boolean;
  coordinates?: { lat: number; lng: number };
  operating_hours?: { open: string; close: string };
  access_control_type?: 'manual' | 'rfid' | 'biometric' | 'qr_code' | 'hybrid';
}

interface GateCreationAttributes extends Omit<GateAttributes, 'gate_id'> {}

@Table({
  tableName: 'gates',
  timestamps: true,
  underscored: true,
  freezeTableName: true,
  paranoid: true,
})
export class Gate extends Model<GateAttributes, GateCreationAttributes> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
  })
  declare gate_id: string;

  @ForeignKey(() => Estate)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare estate_id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  declare gate_code: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare gate_name: string;

  @Column({
    type: DataType.ENUM('main', 'service', 'pedestrian', 'emergency', 'vip'),
    allowNull: false,
    defaultValue: 'main',
  })
  declare gate_type: 'main' | 'service' | 'pedestrian' | 'emergency' | 'vip';

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  declare is_active: boolean;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  declare coordinates: { lat: number; lng: number };

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  declare operating_hours: { open: string; close: string };

  @Column({
    type: DataType.ENUM('manual', 'rfid', 'biometric', 'qr_code', 'hybrid'),
    allowNull: true,
    defaultValue: 'manual',
  })
  declare access_control_type: 'manual' | 'rfid' | 'biometric' | 'qr_code' | 'hybrid';

  @BelongsTo(() => Estate)
  declare estate: Estate;
}
