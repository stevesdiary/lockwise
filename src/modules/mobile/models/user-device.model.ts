import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../shared/core/database';

class UserDevice extends Model {
  public device_id!: number;
  public user_id!: number;
  public device_token!: string;
  public platform!: string;
}

UserDevice.init({
  device_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  device_token: {
    type: DataTypes.STRING,
    allowNull: false
  },
  platform: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  sequelize,
  tableName: 'user_devices',
  timestamps: true
});

export default UserDevice;
