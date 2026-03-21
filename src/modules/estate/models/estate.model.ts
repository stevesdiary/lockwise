import { Table, Model, Column, DataType, Index, BelongsTo, HasMany, ForeignKey } from 'sequelize-typescript';
import { EstateAttributes, EstateCreationAttributes } from '../types/estate.types';
import { Street } from './street.model';
import { Gate } from './gate.model';
import { User } from '../../auth/models/user.model';
import AccessLog from '../../access/models/access-log.model';
import { Referrer } from '../../payment/models/referrer.model';
import { Plan } from '../../payment/models/plan.model';

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

export class Estate extends Model<EstateAttributes, EstateCreationAttributes> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
  })
  declare estate_id: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    unique: true,
  })
  declare estate_code: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.ENUM('residential', 'mixed', 'other', 'commercial'),
    allowNull: false,
  })
  declare type: string;

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

  @Column({
    type: DataType.STRING(2),
    allowNull: false,
    defaultValue: 'NG'
  })
  declare country_code: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: 'Africa/Lagos'
  })
  declare timezone: string;

  @Column({
    type: DataType.STRING(3),
    allowNull: false,
    defaultValue: 'NGN'
  })
  declare currency_code: string;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    defaultValue: {}
  })
  declare location_details: {
    street_address?: string;
    area_district?: string;
    administrative_area?: string;
    postal_code?: string;
    plus_code?: string;
    digital_address?: string;
    landmark?: string;
    coordinates?: { lat: number; lng: number };
    format?: string;
  };

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    defaultValue: []
  })
  declare access_points: Array<{
    gate_id?: string;
    gate_name: string;
    type: string;
    is_active: boolean;
  }>;

  @Column({
    type: DataType.JSONB,
    allowNull: true
  })
  declare geo_fencing: {
    center?: { lat: number; lng: number };
    radius_meters?: number;
  };

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare total_number_of_apartments: number;

  @Column({
    type: DataType.INTEGER
  })
  declare total_floors: number;

  @Column({
    type: DataType.INTEGER
  })
  declare total_parking_spaces: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true
  })
  declare number_of_staff: number;

  @Column({
    type: DataType.ENUM('active', 'inactive', 'under_maintenance', 'suspended', 'pending', 'draft'),
    defaultValue: 'pending'
  })
  declare status: 'active' | 'inactive' | 'under_maintenance' | 'suspended' | 'pending' | 'draft';

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    defaultValue: 1,
  })
  declare onboarding_step: number;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    defaultValue: () => ({ gates_configured: false, residents_invited: false }),
  })
  declare setup_checklist: { gates_configured: boolean; residents_invited: boolean };

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    defaultValue: {}
  })
  declare contact_info: {
    phone?: string;
    email?: string;
    address?: string;
  };

  @Column({
    type: DataType.ENUM('approved', 'pending', 'declined'),
    allowNull: false,
    defaultValue: 'pending'
  })
  declare approval_status: string;

  @Column({
    type: DataType.DATE
  })
  declare approved_on: Date;

  @Column({
    type: DataType.STRING
  })
  declare approved_by: string;

  @HasMany(() => User, {as: 'users'})
  declare users: User[];

  @HasMany(() => Street)
  declare streets: Street[];

  @HasMany(() => Gate)
  declare gates: Gate[];

  @ForeignKey(() => Referrer)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  declare referrer_id: string;

  @BelongsTo(() => Referrer)
  declare referrer: Referrer;

  @HasMany(() => User, { as: 'estateResidents' })
  declare estateResidents: User[];

  @ForeignKey(() => Plan)
  @Column(DataType.UUID)
  declare plan_id: string;

  @BelongsTo(() => Plan)
  declare plan: Plan;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare created_by: string;

  @BelongsTo(() => User, { as: 'creator' })
  declare creator: User;
}
