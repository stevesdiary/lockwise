import { Table, Model, Column, DataType, Index, Default, HasMany } from 'sequelize-typescript';
import { Resident } from '../resident/resident.model';

@Table ({
  tableName: 'estates',
  indexes: [
    {
      name: 'estate_id_index',
      fields: ['estate_id'],
      using: 'BTREE',
      unique: true,
    },
  ],
  timestamps: true,
  underscored: true,
  freezeTableName: true,
  paranoid: true,
})

export class Estate extends Model<Estate> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  declare estate_id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare address: string;
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare city: string;
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare state: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  declare country: string;

  @HasMany(() => Resident, {
    foreignKey: 'estate_id',
  })
  declare residents: Resident[];

  @Column({
    type: DataType.STRING
  })
  declare zip_code: string;
}

