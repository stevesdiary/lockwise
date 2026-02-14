import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../shared/core/database';

class AccessCode extends Model {
  public code_id!: number;
  public code!: string;
  public user_id!: number;
  public estate_id!: number;
  public guest_name?: string;
  public valid_from!: Date;
  public valid_until!: Date;
  public status!: string;
  public created_at?: Date;
  public updated_at?: Date;
}

AccessCode.init({
  code_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  estate_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  guest_name: {
    type: DataTypes.STRING
  },
  valid_from: {
    type: DataTypes.DATE,
    allowNull: false
  },
  valid_until: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'active'
  }
}, {
  sequelize,
  tableName: 'access_codes',
  timestamps: true,
  underscored: true
});

export default AccessCode;
