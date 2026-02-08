'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'user_type', {
      type: Sequelize.ENUM('resident', 'security', 'manager', 'admin'),
      allowNull: false,
      defaultValue: 'resident'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'user_type');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_user_type";');
  }
};
