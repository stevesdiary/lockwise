import { Table, Model, Column, DataType } from 'sequelize-typescript';

export interface DemoRequestAttributes {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  estate_size: string | null;
  message: string | null;
  status: 'pending' | 'contacted' | 'scheduled' | 'completed' | 'cancelled';
  contacted_at: Date | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export type DemoRequestCreationAttributes = Omit<DemoRequestAttributes, 'id' | 'created_at' | 'updated_at' | 'contacted_at' | 'notes'> & {
  contacted_at?: Date;
  notes?: string;
};

@Table({
  tableName: 'demo_requests',
  timestamps: true,
  underscored: true,
  freezeTableName: true,
})
export class DemoRequest extends Model<DemoRequestAttributes, DemoRequestCreationAttributes> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  declare id: string;

  @Column({
    type: DataType.STRING(200),
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare email: string;

  @Column({
    type: DataType.STRING(30),
    allowNull: true,
  })
  declare phone: string | null;

  @Column({
    type: DataType.STRING(200),
    allowNull: true,
  })
  declare company: string | null;

  @Column({
    type: DataType.STRING(20),
    allowNull: true,
  })
  declare estate_size: string | null;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare message: string | null;

  @Column({
    type: DataType.ENUM('pending', 'contacted', 'scheduled', 'completed', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending',
  })
  declare status: 'pending' | 'contacted' | 'scheduled' | 'completed' | 'cancelled';

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare contacted_at: Date | null;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare notes: string | null;
}
