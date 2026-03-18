'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_devices', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      user_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      device_id: { type: Sequelize.STRING(255), allowNull: false },
      fcm_token: { type: Sequelize.TEXT },
      platform: { type: Sequelize.STRING(20), validate: { isIn: [['ios', 'android']] } },
      app_version: { type: Sequelize.STRING(20) },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') }
    }, { ifNotExists: true });

    await queryInterface.addConstraint('user_devices', {
      fields: ['user_id', 'device_id'],
      type: 'unique',
      name: 'user_devices_user_id_device_id_unique'
    });

    await queryInterface.createTable('sync_queue', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      user_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      action: { type: Sequelize.STRING(50), allowNull: false },
      data: { type: Sequelize.JSONB, allowNull: false },
      status: { type: Sequelize.STRING(20), defaultValue: 'pending', validate: { isIn: [['pending', 'processed', 'failed']] } },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') },
      processed_at: { type: Sequelize.DATE }
    }, { ifNotExists: true });

    await queryInterface.createTable('deep_links', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      user_id: { type: Sequelize.UUID, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      link_type: { type: Sequelize.STRING(50), allowNull: false },
      target_id: { type: Sequelize.STRING(255) },
      url: { type: Sequelize.TEXT, allowNull: false },
      expires_at: { type: Sequelize.DATE },
      clicks: { type: Sequelize.INTEGER, defaultValue: 0 },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') }
    }, { ifNotExists: true });

    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "idx_user_devices_user" ON "user_devices" ("user_id")');
    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "idx_user_devices_fcm" ON "user_devices" ("fcm_token")');
    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "idx_sync_queue_user" ON "sync_queue" ("user_id")');
    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "idx_sync_queue_status" ON "sync_queue" ("status")');
    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "idx_deep_links_user" ON "deep_links" ("user_id")');
    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "idx_deep_links_type" ON "deep_links" ("link_type")');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('deep_links');
    await queryInterface.dropTable('sync_queue');
    await queryInterface.dropTable('user_devices');
  }
};
