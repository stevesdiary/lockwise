'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('access_logs', 'gate_id');
    await queryInterface.removeColumn('access_logs', 'is_multi_entry');
    await queryInterface.removeColumn('access_logs', 'max_entries');
    await queryInterface.removeColumn('access_logs', 'used_entries');
    await queryInterface.removeColumn('access_logs', 'valid_from');
    await queryInterface.removeColumn('access_logs', 'visitor_details');
    await queryInterface.removeColumn('access_logs', 'guest_phone');
    await queryInterface.removeColumn('access_logs', 'whatsapp_sent');
    await queryInterface.removeColumn('access_logs', 'whatsapp_sent_at');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('access_logs', 'gate_id', { type: Sequelize.STRING });
    await queryInterface.addColumn('access_logs', 'is_multi_entry', { type: Sequelize.BOOLEAN, defaultValue: false });
    await queryInterface.addColumn('access_logs', 'max_entries', { type: Sequelize.INTEGER });
    await queryInterface.addColumn('access_logs', 'used_entries', { type: Sequelize.INTEGER, defaultValue: 0 });
    await queryInterface.addColumn('access_logs', 'valid_from', { type: Sequelize.DATE });
    await queryInterface.addColumn('access_logs', 'visitor_details', { type: Sequelize.JSONB });
    await queryInterface.addColumn('access_logs', 'guest_phone', { type: Sequelize.STRING });
    await queryInterface.addColumn('access_logs', 'whatsapp_sent', { type: Sequelize.BOOLEAN, defaultValue: false });
    await queryInterface.addColumn('access_logs', 'whatsapp_sent_at', { type: Sequelize.DATE });
  }
};
