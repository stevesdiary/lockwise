'use strict';

// Consolidated from two conflicting create migrations (20260210000008 + 20260220000001).
// Uses the more complete definition from 20260220000001 (INTEGER PK, is_active, last_used).

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_devices', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      fcm_token: { type: Sequelize.TEXT, allowNull: true, unique: true },
      device_type: { type: Sequelize.STRING, allowNull: true },
      device_model: { type: Sequelize.STRING, allowNull: true },
      app_version: { type: Sequelize.STRING, allowNull: true },
      is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      last_used: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('user_devices', ['user_id']);
    await queryInterface.addIndex('user_devices', ['fcm_token']);
    await queryInterface.addIndex('user_devices', ['is_active']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('user_devices');
  },
};
