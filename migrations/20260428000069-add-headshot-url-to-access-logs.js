'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('access_logs', 'headshot_url', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('access_logs', 'headshot_url');
  }
};
