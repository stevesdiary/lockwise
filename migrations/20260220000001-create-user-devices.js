'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_devices', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      fcm_token: {
        type: Sequelize.TEXT,
        allowNull: false,
        unique: true
      },
      device_type: {
        type: Sequelize.STRING,
        allowNull: true
      },
      device_model: {
        type: Sequelize.STRING,
        allowNull: true
      },
      app_version: {
        type: Sequelize.STRING,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      last_used: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    await queryInterface.addIndex('user_devices', ['user_id']);
    await queryInterface.addIndex('user_devices', ['fcm_token']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user_devices');
  }
};