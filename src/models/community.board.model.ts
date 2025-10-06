import { Table, Model, Column, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { User } from './user.model';
import { Estate } from './estate.model';

export interface CommunityPostAttributes {
  id: string;
  estate_id: string;
  user_id: string;
  type: string;
  title?: string;
  content: string;
  attachments?: any;
  is_pinned: boolean;
  created_at: Date;
  updated_at: Date;
}

export type CommunityPostCreationAttributes = Omit<CommunityPostAttributes, 'id' | 'created_at' | 'updated_at'>;

@Table({
  tableName: 'community_posts',
  timestamps: true,
  underscored: true,
  freezeTableName: true
})
export class CommunityPost extends Model<CommunityPostAttributes, CommunityPostCreationAttributes> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4
  })
  declare id: string;

  @ForeignKey(() => Estate)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  declare estate_id: string;

  @BelongsTo(() => Estate)
  declare estate: Estate;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  declare user_id: string;

  @BelongsTo(() => User)
  declare user: User;

  @Column({
    type: DataType.ENUM('announcement', 'chat', 'meeting', 'event', 'alert'),
    allowNull: false
  })
  declare type: string;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  declare title: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false
  })
  declare content: string;

  @Column({
    type: DataType.JSONB,
    allowNull: true
  })
  declare attachments: any;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false
  })
  declare is_pinned: boolean;

  @HasMany(() => CommunityComment, { foreignKey: 'post_id' })
  declare comments: CommunityComment[];
}

export interface CommunityCommentAttributes {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: Date;
  updated_at: Date;
}

export type CommunityCommentCreationAttributes = Omit<CommunityCommentAttributes, 'id' | 'created_at' | 'updated_at'>;

@Table({
  tableName: 'community_comments',
  timestamps: true,
  underscored: true,
  freezeTableName: true
})
export class CommunityComment extends Model<CommunityCommentAttributes, CommunityCommentCreationAttributes> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4
  })
  declare id: string;

  @ForeignKey(() => CommunityPost)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  declare post_id: string;

  @BelongsTo(() => CommunityPost)
  declare post: CommunityPost;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  declare user_id: string;

  @BelongsTo(() => User)
  declare user: User;

  @Column({
    type: DataType.TEXT,
    allowNull: false
  })
  declare content: string;
}