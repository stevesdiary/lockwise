import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../shared/core/database';

class UserDevice extends Model {
  public id!: number;
  public user_id!: string;
  public fcm_token!: string | null;
  public device_type!: string | null;
  public device_model!: string | null;
  public app_version!: string | null;
  public is_active!: boolean;
  public last_used!: Date;
}

UserDevice.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  fcm_token: {
    type: DataTypes.TEXT,
    allowNull: true,
    unique: true
  },
  device_type: {
    type: DataTypes.STRING,
    allowNull: true
  },
  device_model: {
    type: DataTypes.STRING,
    allowNull: true
  },
  app_version: {
    type: DataTypes.STRING,
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  last_used: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  tableName: 'user_devices',
  timestamps: true,
  underscored: true
});

export default UserDevice;
