'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('access_logs', 'valid_from', { type: Sequelize.DATE, allowNull: true });
    await queryInterface.addColumn('access_logs', 'guest_phone', { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn('access_logs', 'entry_time', { type: Sequelize.DATE, allowNull: true });
    await queryInterface.addColumn('access_logs', 'exit_time', { type: Sequelize.DATE, allowNull: true });
    await queryInterface.addColumn('access_logs', 'scanned_by', { type: Sequelize.UUID, allowNull: true });
    await queryInterface.addColumn('access_logs', 'remark', { type: Sequelize.TEXT, allowNull: true });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('access_logs', 'valid_from');
    await queryInterface.removeColumn('access_logs', 'guest_phone');
    await queryInterface.removeColumn('access_logs', 'entry_time');
    await queryInterface.removeColumn('access_logs', 'exit_time');
    await queryInterface.removeColumn('access_logs', 'scanned_by');
    await queryInterface.removeColumn('access_logs', 'remark');
  }
};
