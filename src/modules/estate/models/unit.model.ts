import { Column, Table, DataType, Model, ForeignKey, HasMany, BelongsTo } from "sequelize-typescript";
import { Street } from "./street.model";
import { Resident } from './resident.model';

interface UnitAttributes {
  id: string;
  street_id: string;
  unit_identifier: string;
  block?: string;
  floor?: number;
  unit_type?: string;
  unit_details?: {
    plot_number?: string;
    house_number?: string;
    digital_address?: string;
    landmark?: string;
    coordinates?: { lat: number; lng: number };
    custom_info?: Record<string, any>;
  };
  status?: 'occupied' | 'vacant' | 'under_construction' | 'reserved';
}

interface UnitCreationAttributes extends Omit<UnitAttributes, 'id'> {}

@Table({ 
  tableName: 'units',
  timestamps: true,
  underscored: true,
  freezeTableName: true,
  paranoid: true,
})
export class Unit extends Model<UnitAttributes, UnitCreationAttributes> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
    primaryKey: true
  })
  declare id: string;

  @ForeignKey(() => Street)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  declare street_id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare unit_identifier: string;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    defaultValue: {}
  })
  declare unit_details: {
    plot_number?: string;
    house_number?: string;
    digital_address?: string;
    landmark?: string;
    coordinates?: { lat: number; lng: number };
    custom_info?: Record<string, any>;
  };

  @Column({
    type: DataType.STRING
  })
  declare block?: string;

  @Column({
    type: DataType.INTEGER
  })
  declare floor?: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: 'flat'
  })
  declare unit_type?: 'flat' | 'duplex' | 'chalet' | 'terrace' | 'plot' | 'house' | 'apartment' | 'villa' | 'studio' | 'other' | string;

  @Column({
    type: DataType.ENUM('occupied', 'vacant', 'under_construction', 'reserved'),
    allowNull: true,
    defaultValue: 'vacant'
  })
  declare status?: 'occupied' | 'vacant' | 'under_construction' | 'reserved';

  @BelongsTo(() => Street, { foreignKey: 'street_id', as: 'street' })
  declare street: Street;

  @HasMany(() => Resident, { as: 'residentsInUnit' })
  declare residentsInUnit?: Resident[];
}
