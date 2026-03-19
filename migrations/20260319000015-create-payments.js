'use strict';

// FIXED from original migration: uses id (UUID) as PK, estate_id + user_id + subscription_id
// instead of payment_id + resident_id. Matches Payment model exactly.

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('payments', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      estate_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'estates', key: 'estate_id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      currency: { type: Sequelize.STRING, allowNull: false, defaultValue: 'NGN' },
      payment_status: {
        type: Sequelize.ENUM('pending', 'completed', 'failed', 'refunded'),
        allowNull: false,
        defaultValue: 'pending',
      },
      payment_provider: { type: Sequelize.STRING, allowNull: false },
      payment_method: {
        type: Sequelize.ENUM('credit_card', 'debit_card', 'bank_transfer', 'cash', 'POS', 'paystack'),
        allowNull: false,
      },
      reference: { type: Sequelize.STRING, allowNull: true },
      email: { type: Sequelize.STRING, allowNull: false },
      payment_date: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      refund_amount: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      refund_date: { type: Sequelize.DATE, allowNull: true },
      payment_data: { type: Sequelize.JSON, allowNull: true },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      subscription_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'subscriptions', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
      deleted_at: { type: Sequelize.DATE, allowNull: true },
    });

    await queryInterface.addIndex('payments', ['user_id']);
    await queryInterface.addIndex('payments', ['estate_id']);
    await queryInterface.addIndex('payments', ['reference']);
    await queryInterface.addIndex('payments', ['payment_status']);
    await queryInterface.addIndex('payments', ['subscription_id']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('payments');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_payments_payment_status"');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_payments_payment_method"');
  },
};
