import { QueryTypes } from 'sequelize';
import sequelize from '../../../shared/core/database';

interface DeviceData {
  user_id: string;
  fcm_token: string;
  device_type?: string;
  device_model?: string;
  app_version?: string;
}

class DeviceService {
  async registerDevice(deviceData: DeviceData) {
    const query = `
      INSERT INTO user_devices (user_id, fcm_token, device_type, device_model, app_version, created_at, updated_at)
      VALUES (:user_id, :fcm_token, :device_type, :device_model, :app_version, NOW(), NOW())
      ON DUPLICATE KEY UPDATE
        device_type = VALUES(device_type),
        device_model = VALUES(device_model),
        app_version = VALUES(app_version),
        is_active = true,
        last_used = NOW(),
        updated_at = NOW()
    `;

    await sequelize.query(query, {
      replacements: {
        user_id: deviceData.user_id,
        fcm_token: deviceData.fcm_token,
        device_type: deviceData.device_type,
        device_model: deviceData.device_model,
        app_version: deviceData.app_version,
      },
      type: QueryTypes.INSERT
    });
  }

  async updateToken(user_id: string, fcm_token: string) {
    const query = `
      UPDATE user_devices 
      SET fcm_token = :fcm_token, last_used = NOW(), updated_at = NOW()
      WHERE user_id = :user_id AND is_active = true
    `;

    await sequelize.query(query, {
      replacements: { user_id, fcm_token },
      type: QueryTypes.UPDATE
    });
  }

  async getUserTokens(user_id: string): Promise<string[]> {
    const query = `
      SELECT fcm_token FROM user_devices 
      WHERE user_id = :user_id AND is_active = true
    `;

    const results = await sequelize.query(query, {
      replacements: { user_id },
      type: QueryTypes.SELECT
    }) as { fcm_token: string }[];

    return results.map(r => r.fcm_token);
  }
}

export default new DeviceService();
