import { Table, Model, Column, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { User } from '../../auth/models/user.model';
import { Estate } from '../../estate/models/estate.model';

@Table({
  tableName: 'maintenance_requests',
  timestamps: true,
  underscored: true,
  paranoid: true,
})
export class MaintenanceRequest extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  declare id: string;

  @ForeignKey(() => Estate)
  @Column({ type: DataType.UUID, allowNull: false })
  declare estate_id: string;

  @Column({ type: DataType.UUID, allowNull: true })
  declare unit_id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  declare submitted_by: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare title: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare description: string;

  @Column({
    type: DataType.ENUM('plumbing', 'electrical', 'structural', 'common_area', 'security', 'other'),
    allowNull: false,
  })
  declare category: string;

  @Column({
    type: DataType.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium',
  })
  declare priority: string;

  @Column({
    type: DataType.ENUM('open', 'in_progress', 'resolved', 'closed'),
    defaultValue: 'open',
  })
  declare status: string;

  @Column({ type: DataType.JSONB, allowNull: true })
  declare photo_urls: string[] | null;

  @Column({ type: DataType.DATE, allowNull: true })
  declare resolved_at: Date | null;

  @BelongsTo(() => Estate)
  declare estate: Estate;

  @BelongsTo(() => User, 'submitted_by')
  declare submitter: User;

  @HasMany(() => MaintenanceComment)
  declare comments: MaintenanceComment[];
}

@Table({
  tableName: 'maintenance_comments',
  timestamps: true,
  underscored: true,
})
export class MaintenanceComment extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  declare id: string;

  @ForeignKey(() => MaintenanceRequest)
  @Column({ type: DataType.UUID, allowNull: false })
  declare request_id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  declare author_id: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare message: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  declare is_status_change: boolean;

  @Column({ type: DataType.STRING, allowNull: true })
  declare new_status: string | null;

  @BelongsTo(() => MaintenanceRequest)
  declare request: MaintenanceRequest;

  @BelongsTo(() => User)
  declare author: User;
}
