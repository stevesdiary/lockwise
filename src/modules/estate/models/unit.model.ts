import { Column, Table, DataType, Model, ForeignKey, HasMany } from "sequelize-typescript";
import { Street } from "./street.model";
import { Resident } from './resident.model';

interface UnitAttributes {
  id: string;
  street_id: string;
  number: string;
  block?: string;
  floor?: number;
  unit_type?: 'flat' | 'duplex' | 'chalet' | 'terrace' | 'other';
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
    unique: true
  }) 
  declare number: string;

  @Column({
    type: DataType.STRING
  })
  declare block?: string;

  @Column({
    type: DataType.INTEGER
  })
  declare floor?: number;

  @Column({
    type: DataType.ENUM('flat', 'duplex', 'chalet', 'terrace', 'other'),
    allowNull: true
  })
  declare unit_type?: 'flat' | 'duplex' | 'chalet' | 'terrace' | 'other';

  @HasMany(() => Resident, { as: 'residentsInUnit' })
  declare residentsInUnit?: Resident[];
}
