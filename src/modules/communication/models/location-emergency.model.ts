import { Table, Model, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';

@Table({ tableName: 'emergency_contact_categories', timestamps: true, underscored: true, freezeTableName: true })
export class EmergencyContactCategory extends Model {
  @Column({ type: DataType.UUID, primaryKey: true, defaultValue: DataType.UUIDV4 })
  declare id: string;

  @Column({ type: DataType.STRING(100), allowNull: false })
  declare name: string;

  @Column({ type: DataType.STRING(50), allowNull: true })
  declare icon: string | null;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 100 })
  declare priority: number;
}

@Table({ tableName: 'countries', timestamps: false, underscored: true, freezeTableName: true })
export class Country extends Model {
  @Column({ type: DataType.UUID, primaryKey: true, defaultValue: DataType.UUIDV4 })
  declare id: string;

  @Column({ type: DataType.STRING(100), allowNull: false })
  declare name: string;

  @Column({ type: DataType.CHAR(2), allowNull: false, unique: true })
  declare iso_code: string;

  @Column({ type: DataType.STRING(10), allowNull: false })
  declare phone_prefix: string;
}

@Table({ tableName: 'states', timestamps: false, underscored: true, freezeTableName: true })
export class State extends Model {
  @Column({ type: DataType.UUID, primaryKey: true, defaultValue: DataType.UUIDV4 })
  declare id: string;

  @ForeignKey(() => Country)
  @Column({ type: DataType.UUID, allowNull: false })
  declare country_id: string;

  @BelongsTo(() => Country)
  declare country: Country;

  @Column({ type: DataType.STRING(100), allowNull: false })
  declare name: string;

  @Column({ type: DataType.STRING(10), allowNull: true })
  declare code: string | null;
}

@Table({ tableName: 'cities', timestamps: false, underscored: true, freezeTableName: true })
export class City extends Model {
  @Column({ type: DataType.UUID, primaryKey: true, defaultValue: DataType.UUIDV4 })
  declare id: string;

  @ForeignKey(() => State)
  @Column({ type: DataType.UUID, allowNull: false })
  declare state_id: string;

  @BelongsTo(() => State)
  declare state: State;

  @Column({ type: DataType.STRING(100), allowNull: false })
  declare name: string;
}

@Table({ tableName: 'location_emergency_contacts', timestamps: true, underscored: true, freezeTableName: true })
export class LocationEmergencyContact extends Model {
  @Column({ type: DataType.UUID, primaryKey: true, defaultValue: DataType.UUIDV4 })
  declare id: string;

  @ForeignKey(() => EmergencyContactCategory)
  @Column({ type: DataType.UUID, allowNull: false })
  declare category_id: string;

  @BelongsTo(() => EmergencyContactCategory)
  declare category: EmergencyContactCategory;

  @Column({ type: DataType.STRING(200), allowNull: false })
  declare name: string;

  @Column({ type: DataType.STRING(50), allowNull: false })
  declare phone_number: string;

  @Column({ type: DataType.STRING(50), allowNull: true })
  declare alt_phone_number: string | null;

  @ForeignKey(() => Country)
  @Column({ type: DataType.UUID, allowNull: false })
  declare country_id: string;

  @BelongsTo(() => Country)
  declare country: Country;

  @ForeignKey(() => State)
  @Column({ type: DataType.UUID, allowNull: true })
  declare state_id: string | null;

  @BelongsTo(() => State)
  declare state: State;

  @ForeignKey(() => City)
  @Column({ type: DataType.UUID, allowNull: true })
  declare city_id: string | null;

  @BelongsTo(() => City)
  declare city: City;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare description: string | null;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  declare is_active: boolean;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 100 })
  declare priority: number;
}
