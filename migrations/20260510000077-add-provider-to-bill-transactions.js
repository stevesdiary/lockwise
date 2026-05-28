'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('bill_transactions', 'provider', {
      type: Sequelize.ENUM('vtpass', 'kuda'),
      allowNull: false,
      defaultValue: 'vtpass',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('bill_transactions', 'provider');
    await queryInterface.sequelize.query(
      "DROP TYPE IF EXISTS enum_bill_transactions_provider;"
    );
  },
};
