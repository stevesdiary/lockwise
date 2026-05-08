'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('smart_meters', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      estate_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'estates', key: 'estate_id' },
        onDelete: 'SET NULL',
      },
      meter_number: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      disco: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      meter_type: {
        type: Sequelize.ENUM('prepaid', 'postpaid'),
        allowNull: false,
        defaultValue: 'prepaid',
      },
      customer_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      customer_address: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      auto_load_enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      is_verified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    await queryInterface.addIndex('smart_meters', ['user_id']);
    await queryInterface.addIndex('smart_meters', ['meter_number', 'disco'], { unique: true });

    await queryInterface.createTable('electricity_transactions', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      estate_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'estates', key: 'estate_id' },
        onDelete: 'SET NULL',
      },
      smart_meter_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'smart_meters', key: 'id' },
        onDelete: 'SET NULL',
      },
      meter_number: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      disco: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      meter_type: {
        type: Sequelize.ENUM('prepaid', 'postpaid'),
        allowNull: false,
      },
      amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      token: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      units: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('pending', 'successful', 'failed', 'requires_requery'),
        allowNull: false,
        defaultValue: 'pending',
      },
      provider: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      provider_reference: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      request_id: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      attempts: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: [],
      },
      auto_loaded: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      receipt_sent: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    await queryInterface.addIndex('electricity_transactions', ['user_id']);
    await queryInterface.addIndex('electricity_transactions', ['request_id'], { unique: true });
    await queryInterface.addIndex('electricity_transactions', ['status']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('electricity_transactions');
    await queryInterface.dropTable('smart_meters');
  },
};
