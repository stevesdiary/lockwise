import { Table, Model, Column, DataType, Index, BelongsTo, HasMany, ForeignKey } from 'sequelize-typescript';
import { EstateAttributes, EstateCreationAttributes } from '../../types/estate.type';
import { Street } from './street.model';
import { User } from '../user/user.model';
import { Access } from '../access/access.model';
import { Referrer } from '../referrer/referrer.model';
import { Plan } from '../payment/plan.model';

@Table ({
  tableName: 'estates',
  indexes: [
    {
      name: 'estate_id_index',
      fields: ['estate_id', 'invitation_code'],
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
    allowNull: false,
    unique: true,
  })
  declare estate_code: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  declare invitation_code: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare address: string;

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
    type: DataType.NUMBER,
    allowNull: false,
  })
  declare total_number_of_apartments: number;

  @Column({
    type: DataType.NUMBER
  })
  declare total_floors: number;

  @Column({
    type: DataType.NUMBER
  })
  declare total_parking_spaces: number;

  @Column({
    type: DataType.NUMBER
  })
  declare number_of_staff: number;

  @Column({
    type: DataType.ENUM('active', 'inactive', 'under_maintenance', 'suspended', 'pending'),
  })
  declare status: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare contact_phone: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare contact_email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare contact_address: string;

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

  @Column({
    type: DataType.STRING
  })
  declare zip_code: string;

  @HasMany(() => User, {as: 'users'})
  declare users: User[];

  @HasMany(() => Street)
  declare streets: Street[];

  @HasMany(() => Access, {
    foreignKey: 'estate_id'
  })
  declare Accesss: Access[];

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
  
}
