import { Column, DataType, Model, ForeignKey, PrimaryKey, BelongsTo, Table } from "sequelize-typescript";
import { Estate } from "../../estate/models/estate.model";
import { Referrer } from "./referrer.model";

@Table({ tableName: "referral_bonuses", timestamps: true, underscored: true })
export class ReferralBonus extends Model {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  declare id: string;

  @ForeignKey(() => Referrer)
  @Column({ type: DataType.UUID, allowNull: false })
  declare referrer_id: string;

  @ForeignKey(() => Estate)
  @Column({ type: DataType.UUID, allowNull: false })
  declare estate_id: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    defaultValue: 0.0,
    allowNull: false,
    validate: {
      min: 0,
      isDecimal: true,
    },
  })
  declare bonus_amount: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  })
  declare paid: boolean;

  @Column({
    type: DataType.STRING,
    validate: {
      len: [1, 255],
    },
  })
  declare payment_reference: string;

  @BelongsTo(() => Referrer)
  declare referrer: Referrer;

  @BelongsTo(() => Estate)
  declare estate: Estate;
}
