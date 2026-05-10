'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('estate_wallets', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
      },
      estate_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: { model: 'estates', key: 'estate_id' },
        onDelete: 'CASCADE',
      },
      balance: {
        type: Sequelize.DECIMAL(12, 2),
        defaultValue: 0,
        allowNull: false,
      },
      currency: {
        type: Sequelize.STRING,
        defaultValue: 'NGN',
        allowNull: false,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      kuda_account_number: { type: Sequelize.STRING, allowNull: true },
      kuda_account_name: { type: Sequelize.STRING, allowNull: true },
      kuda_tracking_reference: { type: Sequelize.STRING, allowNull: true, unique: true },
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

    await queryInterface.createTable('estate_wallet_transactions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
      },
      estate_wallet_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'estate_wallets', key: 'id' },
        onDelete: 'CASCADE',
      },
      estate_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'estates', key: 'estate_id' },
        onDelete: 'SET NULL',
      },
      type: {
        type: Sequelize.ENUM('credit', 'debit'),
        allowNull: false,
      },
      amount: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      balance_before: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      balance_after: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      description: { type: Sequelize.STRING, allowNull: false },
      category: {
        type: Sequelize.ENUM('funding', 'subscription', 'refund'),
        allowNull: false,
      },
      reference: { type: Sequelize.STRING, allowNull: true, unique: true },
      status: {
        type: Sequelize.ENUM('pending', 'success', 'failed'),
        defaultValue: 'pending',
        allowNull: false,
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

    await queryInterface.addIndex('estate_wallet_transactions', ['estate_wallet_id']);
    await queryInterface.addIndex('estate_wallet_transactions', ['estate_id']);
    await queryInterface.addIndex('estate_wallet_transactions', ['reference']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('estate_wallet_transactions');
    await queryInterface.dropTable('estate_wallets');
  },
};
