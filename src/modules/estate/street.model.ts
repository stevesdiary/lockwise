import { Column, HasMany, ForeignKey, Table, DataType, PrimaryKey, Model, Default } from "sequelize-typescript";
import { Estate } from "./estate.model";
import { Unit } from "./unit.model";

@Table({
  tableName: 'streets',
  timestamps: true,
  underscored: true,
})

export class Street extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
    allowNull: false
  })
  declare street_id: string;

  @ForeignKey(() => Estate)
  @Column({
    type: DataType.UUID
  })
  declare estate_id: string;

  @Column({
    type: DataType.STRING, 
    allowNull: false })
  declare name: string;

  @HasMany(() => Unit)
  declare units: Unit[];
}
