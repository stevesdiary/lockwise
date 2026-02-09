'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add validity fields to access_logs table
    await queryInterface.addColumn('access_logs', 'valid_from', {
      type: Sequelize.DATE,
      allowNull: true
    });
    
    await queryInterface.addColumn('access_logs', 'valid_until', {
      type: Sequelize.DATE,
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    // Remove validity fields from access_logs table
    await queryInterface.removeColumn('access_logs', 'valid_from');
    await queryInterface.removeColumn('access_logs', 'valid_until');
  }
};
