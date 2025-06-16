import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  PrimaryKey,
  HasMany
} from 'sequelize-typescript';
import { User } from '../user/user.model';
import { Estate } from '../estate/estate.model';


@Table({ 
  tableName: 'accesses', 
  timestamps: true,
  freezeTableName: true,
  underscored: true,
  paranoid: true
})

export class Access extends Model {
  @Column({ 
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4
  })
  declare log_id: string;

  @ForeignKey(() => Estate)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  declare estate_id: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  declare resident_id: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  declare user_id: string;

  @Column({
    type: DataType.ENUM('entry', 'exit'),
    allowNull: false
  })
  declare access_type: 'entry' | 'exit';

  @Column({
    type: DataType.DATE,
    allowNull: false
  })
  declare entry_date: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  declare exit_date: Date;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  declare entry_time: string;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  declare exit_time: string;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  declare remark: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  declare access_code: string;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  declare exit_code: string;

  @BelongsTo(() => User, 'user_id')
  declare user?: User;

  @BelongsTo(() => Estate)
  declare estate?: Estate;

  @Column({
    type: DataType.ENUM('RFID', 'QR_code', 'access_code', 'manual_approval'),
    allowNull: false,
    defaultValue: 'access_code'
  })
  declare verification_method: string;

  @Column({
    type: DataType.STRING
  })
  declare vehicle_number: string;

  @Column({
    type: DataType.ENUM('approved', 'pending', 'denied', 'cancelled', 'expired'),
    allowNull: false,
    defaultValue: 'pending'
  })
  declare status: string;

  @Column({
    type: DataType.TEXT
  })
  declare remarks: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  declare created_by: string;

  @Column({
    type: DataType.STRING
  })
  declare approved_by: string;
  
  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  declare is_multi_entry: boolean;
}
