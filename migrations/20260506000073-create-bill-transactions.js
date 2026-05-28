'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('bill_transactions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
      },
      request_id: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
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
      service_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      provider_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      billers_code: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      variation_code: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('pending', 'success', 'failed'),
        defaultValue: 'pending',
        allowNull: false,
      },
      token: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      vtpass_transaction_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      response_code: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      response_description: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    await queryInterface.addIndex('bill_transactions', ['user_id']);
    await queryInterface.addIndex('bill_transactions', ['estate_id']);
    await queryInterface.addIndex('bill_transactions', ['status']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('bill_transactions');
  },
};
