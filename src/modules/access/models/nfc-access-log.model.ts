import { Table, Model, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { NFCCard } from './nfc-card.model';
import { User } from '../../auth';

@Table({
  tableName: 'nfc_access_logs',
  timestamps: false,
  underscored: true,
  freezeTableName: true
})
export class NFCAccessLog extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4
  })
  declare id: string;

  @ForeignKey(() => NFCCard)
  @Column(DataType.UUID)
  declare card_id: string;

  @BelongsTo(() => NFCCard)
  declare card: NFCCard;

  @Column({
    type: DataType.STRING(50),
    allowNull: false
  })
  declare card_uid: string;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  declare user_id: string;

  @BelongsTo(() => User)
  declare user: User;

  @Column({
    type: DataType.STRING(100),
    allowNull: false
  })
  declare access_point: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: false
  })
  declare access_type: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: false
  })
  declare status: string;

  @Column(DataType.STRING(100))
  declare denial_reason: string;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW
  })
  declare timestamp: Date;
}
