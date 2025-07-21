import {
  Table,
  Column,
  Model,
  DataType,
  HasMany
} from 'sequelize-typescript';
import { ReferralBonus } from './referral.bonus.model';
import {
  ReferrerAttributes,
  ReferrerCreationAttributes
} from '../../types/referrer.type';

@Table({
  tableName: 'referrers',
  timestamps: true,
  underscored: true,
})
export class Referrer extends Model<ReferrerAttributes, ReferrerCreationAttributes> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true
  })
  declare id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true
  })
  declare referral_code: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  declare name: string;

  @Column(DataType.STRING)
  declare phone: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  declare email: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    defaultValue: 0
  })
  declare total_earnings: number;

  @HasMany(() => ReferralBonus)
  declare bonuses: ReferralBonus[];
}
