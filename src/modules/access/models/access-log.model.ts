import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../shared/core/database';
import { User } from '../../auth/models/user.model';

class AccessLog extends Model {
  declare id: string;
  declare user_id?: string;
  declare estate_id: string;
  declare status: string;
  declare access_code?: string;
  declare valid_from?: Date;
  declare valid_until?: Date;
  declare approved_by?: string;
  declare guest_name?: string;
  declare guest_phone?: string;
  declare entry_time?: Date;
  declare exit_time?: Date;
  declare scanned_by?: string;
  declare remark?: string;
  declare is_multi_entry: boolean;
  declare max_entries?: number | null;
  declare used_entries: number;
  declare access_direction: 'entry' | 'exit' | 'both';
  declare gate_id?: string | null;
  declare headshot_url?: string | null;
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
  valid_from: {
    type: DataTypes.DATE,
    allowNull: true
  },
  valid_until: {
    type: DataTypes.DATE,
    allowNull: true
  },
  guest_phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  entry_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  exit_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  scanned_by: {
    type: DataTypes.UUID,
    allowNull: true
  },
  remark: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  approved_by: {
    type: DataTypes.UUID,
    allowNull: true
  },
  guest_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  is_multi_entry: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  max_entries: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null
  },
  used_entries: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  access_direction: {
    type: DataTypes.ENUM('entry', 'exit', 'both'),
    allowNull: false,
    defaultValue: 'entry'
  },
  gate_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'gates', key: 'gate_id' }
  },
  headshot_url: {
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
AccessLog.belongsTo(User, { foreignKey: 'scanned_by', as: 'scanner' });

export default AccessLog;
