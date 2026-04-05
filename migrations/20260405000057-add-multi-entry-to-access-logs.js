'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('access_logs', 'is_multi_entry', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });
    await queryInterface.addColumn('access_logs', 'max_entries', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null
    });
    await queryInterface.addColumn('access_logs', 'used_entries', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('access_logs', 'is_multi_entry');
    await queryInterface.removeColumn('access_logs', 'max_entries');
    await queryInterface.removeColumn('access_logs', 'used_entries');
  }
};
