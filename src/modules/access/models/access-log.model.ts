import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../shared/core/database';
import { User } from '../../auth/models/user.model';

class AccessLog extends Model {
  public id!: string;
  public user_id?: string;
  public estate_id!: string;
  public status!: string;
  public access_code?: string;
  public valid_until?: Date;
  public approved_by?: string;
  public guest_name?: string;
  public created_at?: Date;
  public updated_at?: Date;
  public user?: User;
}

AccessLog.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID
  },
  estate_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'expired'),
    defaultValue: 'pending'
  },
  access_code: {
    type: DataTypes.STRING,
    allowNull: true
  },
  valid_until: {
    type: DataTypes.DATE,
    allowNull: true
  },
  approved_by: {
    type: DataTypes.UUID,
    allowNull: true
  },
  guest_name: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  sequelize,
  tableName: 'access_logs',
  timestamps: true,
  underscored: true
});

AccessLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

export default AccessLog;
