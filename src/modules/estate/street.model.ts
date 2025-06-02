import { Column, HasMany, ForeignKey, Table, DataType, PrimaryKey, Model, Default } from "sequelize-typescript";
import { Estate } from "./estate.model";
import { Unit } from "./unit.model";

@Table({ tableName: 'streets' })
export class Street extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

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
