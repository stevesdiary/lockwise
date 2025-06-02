import { Column, Table, BeforeCreate, Model, DataType, BelongsTo } from 'sequelize-typescript';
import { Subscription } from './subscription.model';

@Table({
  tableName: 'plans',
  timestamps: true,
  underscored: true,
  freezeTableName: true
})

export class Plan extends Model {
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
  declare name: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true
  })
  declare description: string;

  @Column({
    type: DataType.ENUM('biannually', 'quarterly', 'annually'),
    allowNull: false
  })
  declare billing_cycle: string;

  @Column(DataType.ENUM('regular', 'premium'))
  declare category: 'regular' | 'premium';

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: 'Duration in days'
  })
  declare duration: number;

  @BeforeCreate
    static setDuration(plan: Plan) {
      const cycleToDays: Record<string, number> = {
        biannually: 182,
        quarterly: 91,
        annually: 365
      };
      plan.duration = cycleToDays[plan.billing_cycle] || 0;
    }


  @Column({
    type: DataType.DECIMAL,
    allowNull: false
  })
  declare price: number;
  

  // @BelongsTo(() => Subscription)
}
