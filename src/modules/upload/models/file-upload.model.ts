import { Table, Model, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from '../../auth/models/user.model';
import { Estate } from '../../estate/models/estate.model';

@Table({
  tableName: 'file_uploads',
  timestamps: true,
  underscored: true,
})
export class FileUpload extends Model {
  @Column({ type: DataType.UUID, primaryKey: true, defaultValue: DataType.UUIDV4 })
  declare id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  declare user_id: string;

  @ForeignKey(() => Estate)
  @Column({ type: DataType.UUID, allowNull: true })
  declare estate_id: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare filename: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare original_name: string;

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  declare file_key: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare file_url: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare thumbnail_url: string;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare file_size: number;

  @Column({ type: DataType.STRING, allowNull: true })
  declare mime_type: string;

  @Column({ type: DataType.ENUM('document', 'image', 'general'), allowNull: false, defaultValue: 'general' })
  declare upload_type: 'document' | 'image' | 'general';

  @Column({ type: DataType.STRING, allowNull: true, defaultValue: 'general' })
  declare folder: string;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  declare is_public: boolean;

  @BelongsTo(() => User, 'user_id')
  declare user: User;

  @BelongsTo(() => Estate, 'estate_id')
  declare estate: Estate;
}
