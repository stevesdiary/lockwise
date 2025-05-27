// src/models/AccessLog.ts
import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  BeforeCreate,
} from 'sequelize-typescript';
// import { v4 as uuidv4 } from 'uuid';
import { User } from '../user/user.model';
import { date } from 'yup';

@Table({ 
  tableName: 'access_logs', 
  timestamps: true,
  freezeTableName: true,
  underscored: true,
  paranoid: true
})

export default class AccessLog extends Model<AccessLog> {
  @Column({ 
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4
  })
  declare id: string;

  @ForeignKey(() => User)
  @Column({ 
    allowNull: false, 
    type: DataType.UUID 
  })
  declare user_id: string;

  @BelongsTo(() => User)
  declare user: User;

  // Auto-generate a 6-digit access code for entry/exit
  @Column({ allowNull: false, type: DataType.STRING(6) })
  declare access_code: string;

  @Column({
    type: DataType.DATEONLY
  })
  declare date_in: Date;

  @Column({
    type: DataType.DATEONLY
  })
  declare date_out: Date;

  @Column({ 
    allowNull: true, 
    type: DataType.DATE 
  })
  declare entry_time: Date;

  @Column({ 
    allowNull: true, 
    type: DataType.DATE 
  })
  declare exit_time: Date;
}
