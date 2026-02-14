import { Table, Model, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from '../../auth/models/user.model';

export interface FaqAttributes {
  id: string;
  question: string;
  answer: string;
  category: string;
  is_active: boolean;
  order_index: number;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export type FaqCreationAttributes = Omit<FaqAttributes, 'id' | 'created_at' | 'updated_at' | 'is_active' | 'order_index'> & {
  is_active?: boolean;
  order_index?: number;
};

@Table({
  tableName: 'faqs',
  timestamps: true,
  underscored: true,
  freezeTableName: true,
  paranoid: true
})
export class Faq extends Model<FaqAttributes, FaqCreationAttributes> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4
  })
  declare id: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false
  })
  declare question: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false
  })
  declare answer: string;

  @Column({
    type: DataType.ENUM('general', 'access_codes', 'payments', 'security', 'technical'),
    allowNull: false,
    defaultValue: 'general'
  })
  declare category: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true
  })
  declare is_active: boolean;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0
  })
  declare order_index: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  declare created_by: string;

  @BelongsTo(() => User, { as: 'creator' })
  declare creator: User;
}