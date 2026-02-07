import { Table, Model, Column, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { User } from '../../auth/models/user.model';
import { Estate } from '../../estate/models/estate.model';
import { NFCAccessLog } from './nfc-access-log.model';

@Table({
  tableName: 'nfc_cards',
  timestamps: true,
  underscored: true,
  freezeTableName: true
})
export class NFCCard extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4
  })
  declare id: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    unique: true
  })
  declare card_uid: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  declare user_id: string;

  @BelongsTo(() => User)
  declare user: User;

  @ForeignKey(() => Estate)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  declare estate_id: string;

  @BelongsTo(() => Estate)
  declare estate: Estate;

  @Column({
    type: DataType.STRING(20),
    defaultValue: 'active'
  })
  declare status: string;

  @Column({
    type: DataType.DATEONLY,
    defaultValue: DataType.NOW
  })
  declare issued_date: Date;

  @Column(DataType.DATEONLY)
  declare expiry_date: Date;

  @Column(DataType.DATE)
  declare last_used: Date;

  @HasMany(() => NFCAccessLog)
  declare accessLogs: NFCAccessLog[];
}
