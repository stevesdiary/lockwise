'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('wallets', 'kuda_account_number', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null,
    });
    await queryInterface.addColumn('wallets', 'kuda_account_name', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null,
    });
    await queryInterface.addColumn('wallets', 'kuda_tracking_reference', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('wallets', 'kuda_account_number');
    await queryInterface.removeColumn('wallets', 'kuda_account_name');
    await queryInterface.removeColumn('wallets', 'kuda_tracking_reference');
  },
};
