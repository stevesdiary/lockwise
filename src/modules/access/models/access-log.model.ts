import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../shared/core/database';

class AccessLog extends Model {
  public log_id!: number;
  public user_id?: number;
  public estate_id!: number;
  public access_type!: string;
  public entry_time?: Date;
  public exit_time?: Date;
  public status!: string;
  public created_at?: Date;
  public updated_at?: Date;
}

AccessLog.init({
  log_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER
  },
  estate_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  access_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  entry_time: {
    type: DataTypes.DATE
  },
  exit_time: {
    type: DataTypes.DATE
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending'
  }
}, {
  sequelize,
  tableName: 'access_logs',
  timestamps: true,
  underscored: true
});

export default AccessLog;
