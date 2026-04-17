import { Table, Model, Column, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { User } from '../../auth/models/user.model';
import { Estate } from '../../estate/models/estate.model';

@Table({
  tableName: 'community_messages',
  underscored: true,
})
export class CommunityMessage extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  declare id: string;

  @ForeignKey(() => Estate)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'estate_id',
  })
  declare estate_id: string;

  @BelongsTo(() => Estate, 'estate_id')
  declare estate: Estate;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare user_id: string;

  @BelongsTo(() => User)
  declare user: User;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    defaultValue: '',
  })
  declare message: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare file_url: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare file_name: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare file_type: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare file_size: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  declare is_announcement: boolean;
}
