import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../shared/core/database';
import AccessLog from './access-log.model';

class AccessEntry extends Model {
  public entry_id!: number;
  public access_log_id!: number;
  public entry_time!: Date;
  public exit_time?: Date;
  public gate_id?: string;
  public scanned_by?: string;
  public remarks?: string;
  public created_at?: Date;
  public updated_at?: Date;
}

AccessEntry.init({
  entry_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  access_log_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'access_logs',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  entry_time: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  exit_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  gate_id: {
    type: DataTypes.STRING,
    allowNull: true
  },
  scanned_by: {
    type: DataTypes.STRING,
    allowNull: true
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  sequelize,
  tableName: 'access_entries',
  timestamps: true,
  underscored: true
});

// Define associations
AccessEntry.belongsTo(AccessLog, {
  foreignKey: 'access_log_id',
  as: 'accessLog'
});

AccessLog.hasMany(AccessEntry, {
  foreignKey: 'access_log_id',
  as: 'accessEntries'
});

export default AccessEntry;