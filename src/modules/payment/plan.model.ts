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
    type: DataType.ENUM('monthly','biannually', 'quarterly', 'annually'),
    allowNull: false
  })
  declare billing_cycle: string;

  @Column({
    type: DataType.ENUM('basic', 'standard', 'premium'),
    allowNull: false,
    defaultValue: 'basic',
  })
  declare category: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 1,
    comment: 'Duration in days'
  })
  declare duration: number;

  @BeforeCreate
    static setDuration(plan: Plan) {
      const cycleToDays: Record<string, number> = {
        annually: 365,
        biannually: 182,
        quarterly: 91,
        monthly: 30
      };
      plan.duration = cycleToDays[plan.billing_cycle] || 1;
    }

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false
  })
  declare price: number;
  
  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  declare currency: string; 
}
