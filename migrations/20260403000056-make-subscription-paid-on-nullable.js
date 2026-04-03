'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('subscriptions', 'paid_on', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Set any nulls to now() before restoring NOT NULL constraint
    await queryInterface.sequelize.query(
      `UPDATE subscriptions SET paid_on = NOW() WHERE paid_on IS NULL`
    );
    await queryInterface.changeColumn('subscriptions', 'paid_on', {
      type: Sequelize.DATE,
      allowNull: false,
    });
  },
};
