import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../shared/core/database';
import { User } from '../../auth/models/user.model';

class AccessLog extends Model {
  declare id: string;
  declare user_id?: string;
  declare estate_id: string;
  declare status: string;
  declare access_code?: string;
  declare valid_until?: Date;
  declare approved_by?: string;
  declare guest_name?: string;
  declare created_at?: Date;
  declare updated_at?: Date;
  declare user?: User;
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
    type: DataTypes.ENUM('active', 'used', 'approved', 'rejected', 'expired', 'revoked'),
    defaultValue: 'active'
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
