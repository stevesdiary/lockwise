'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('subscriptions', 'grace_period_end_date', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('subscriptions', 'last_notification_sent', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    // Add 'grace_period' to the status ENUM
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_subscriptions_status" ADD VALUE IF NOT EXISTS 'grace_period'`
    );
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('subscriptions', 'grace_period_end_date');
    await queryInterface.removeColumn('subscriptions', 'last_notification_sent');
    // Note: PostgreSQL does not support removing enum values without recreating the type.
  },
};
