import { Table, Model, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Estate } from '../models/estate.model';
import { AddressAttributes, AddressCreationAttributes } from '../types/address.type';

@Table ({
  tableName: 'addresses',
  timestamps: true,
  underscored: true,
  freezeTableName: true,
  paranoid: true
})

export class Address extends Model<AddressAttributes, AddressCreationAttributes> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4
  })
  declare address_id: string;

  @ForeignKey(() => Estate)
  @Column({
    allowNull: false,
    type: DataType.STRING
  })
  declare estate_id: string;

  @BelongsTo(()=> Estate)
  declare estate: Estate;

  @Column({
      type: DataType.STRING
    })
    declare street: string;
  
  @Column({
    type: DataType.STRING
  })
  declare building: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  declare apartment_number: string;

  @Column({
    type: DataType.STRING
  })
  declare city: string;

  @Column({
    type: DataType.STRING
  })
  declare state: string;

  @Column({
    type: DataType.STRING
  })
  declare country: string;

  @Column({
    type: DataType.STRING
  })
  declare zip_code: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true
  })
  declare available: boolean;
}
