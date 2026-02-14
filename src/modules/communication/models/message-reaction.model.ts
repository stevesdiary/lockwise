import { Table, Model, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from '../../auth/models/user.model';
import { CommunityMessage } from './community-message.model';

@Table({
  tableName: 'message_reactions',
  underscored: true,
})
export class MessageReaction extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  declare id: string;

  @ForeignKey(() => CommunityMessage)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare message_id: string;

  @BelongsTo(() => CommunityMessage)
  declare message: CommunityMessage;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare user_id: string;

  @BelongsTo(() => User)
  declare user: User;

  @Column({
    type: DataType.STRING(10),
    allowNull: false,
  })
  declare emoji: string;
}
