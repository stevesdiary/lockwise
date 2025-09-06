import { Column, DataType, Model, ForeignKey, PrimaryKey, BelongsTo, Table } from "sequelize-typescript";
import { Estate } from "./estate.model";
import { Referrer } from "./referrer.model";

@Table({ tableName: 'referral_bonuses', timestamps: true, underscored: true })
export class ReferralBonus extends Model {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  declare id: string;

  @ForeignKey(() => Referrer)
  @Column({ type: DataType.UUID })
  declare referrer_id: string;

  @ForeignKey(() => Estate)
  @Column({ type: DataType.UUID })
  declare estate_id: string;

  @Column({ 
    type: DataType.DECIMAL(10, 2),
    defaultValue: 0.00
  })
  declare bonus_amount: number;

  @Column({ 
    type: DataType.BOOLEAN, 
    defaultValue: false 
  })
  declare paid: boolean;

  @Column({ type: DataType.STRING })
  declare payment_reference: string;
}
