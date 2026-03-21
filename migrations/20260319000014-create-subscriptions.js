'use strict';

// FIXED from original migration: uses estate_id (not user_id) to match Subscription model.
// Added: auto_renew, paid_on, expired status, paranoid (deleted_at).

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('subscriptions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      estate_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'estates', key: 'estate_id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      plan_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'plans', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      start_date: { type: Sequelize.DATE, allowNull: false },
      end_date: { type: Sequelize.DATE, allowNull: false },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'cancelled', 'expired'),
        allowNull: false,
      },
      cancel_reason: { type: Sequelize.STRING, allowNull: true },
      auto_renew: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      paid_on: { type: Sequelize.DATE, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
      deleted_at: { type: Sequelize.DATE, allowNull: true },
    });

    await queryInterface.addIndex('subscriptions', ['estate_id']);
    await queryInterface.addIndex('subscriptions', ['status']);
    await queryInterface.addIndex('subscriptions', ['end_date']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('subscriptions');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_subscriptions_status"');
  },
};
