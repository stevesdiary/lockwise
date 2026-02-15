'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'verification_code');
    await queryInterface.removeColumn('users', 'verification_expires');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'verification_code', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('users', 'verification_expires', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  }
};
