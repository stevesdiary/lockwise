'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('access_logs', 'access_direction', {
      type: Sequelize.ENUM('entry', 'exit', 'both'),
      allowNull: false,
      defaultValue: 'entry',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('access_logs', 'access_direction');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_access_logs_access_direction";');
  },
};
