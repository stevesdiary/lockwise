import { Column, Table, DataType, Model, ForeignKey, PrimaryKey, HasMany, BelongsTo } from "sequelize-typescript";
import { Street } from "./street.model";
import { Resident } from '../resident/resident.model';
import { User } from "../user/user.model";
@Table({ 
  tableName: 'units',
  timestamps: true,
  underscored: true,
  freezeTableName: true,
  paranoid: true,
})
export class Unit extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
    primaryKey: true
  })
  declare id: string;

  @ForeignKey(() => Street)
  @Column(DataType.UUID)
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
  declare block: string;

  @Column({
    type: DataType.INTEGER
  })
  declare floor: number;

  @Column({
    type: DataType.ENUM('flat', 'duplex', 'chalet', 'terrace', 'other'),
    allowNull: true
  })
  declare unit_type: string;

  @HasMany(() => Resident, { as: 'residentsInUnit' })
  declare residentsInUnit: Resident[];

}
