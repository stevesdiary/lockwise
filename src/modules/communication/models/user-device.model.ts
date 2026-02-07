import { DataTypes, Model, Optional } from 'sequelize';
import db from '../../../shared/core/database';

interface UserDeviceAttributes {
  id: string;
  user_id: string;
  device_id: string;
  fcm_token: string;
  platform: string;
  app_version: string;
  created_at?: Date;
  updated_at?: Date;
}

interface UserDeviceCreationAttributes extends Optional<UserDeviceAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class UserDevice extends Model<UserDeviceAttributes, UserDeviceCreationAttributes> implements UserDeviceAttributes {
  public id!: string;
  public user_id!: string;
  public device_id!: string;
  public fcm_token!: string;
  public platform!: string;
  public app_version!: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

UserDevice.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    device_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fcm_token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    platform: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    app_version: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize: db,
    tableName: 'user_devices',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'device_id'],
      },
    ],
  }
);
