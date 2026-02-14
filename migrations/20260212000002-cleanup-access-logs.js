'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove unused columns
    await queryInterface.removeColumn('access_logs', 'exit_code');
    await queryInterface.removeColumn('access_logs', 'scheduled_entry_date');
    await queryInterface.removeColumn('access_logs', 'scheduled_entry_end');
    await queryInterface.removeColumn('access_logs', 'scheduled_exit_date');
    await queryInterface.removeColumn('access_logs', 'scheduled_exit_end');
    await queryInterface.removeColumn('access_logs', 'scheduled_entry_time');
    await queryInterface.removeColumn('access_logs', 'scheduled_exit_time');
    await queryInterface.removeColumn('access_logs', 'vehicle_number');
    await queryInterface.removeColumn('access_logs', 'scanned_by');
    await queryInterface.removeColumn('access_logs', 'approved_at');
    await queryInterface.removeColumn('access_logs', 'actual_entry_time');
    await queryInterface.removeColumn('access_logs', 'actual_exit_time');
    await queryInterface.removeColumn('access_logs', 'remarks');
    await queryInterface.removeColumn('access_logs', 'created_by');
    await queryInterface.removeColumn('access_logs', 'deleted_at');
    await queryInterface.removeColumn('access_logs', 'unit_id');
    await queryInterface.removeColumn('access_logs', 'entry_gate_id');
    await queryInterface.removeColumn('access_logs', 'exit_gate_id');
    await queryInterface.removeColumn('access_logs', 'verification_method');
    
    // Remove index on actual_entry_time since column is removed
    await queryInterface.removeIndex('access_logs', ['actual_entry_time']);
  },

  async down(queryInterface, Sequelize) {
    // Restore removed columns
    await queryInterface.addColumn('access_logs', 'exit_code', { type: Sequelize.STRING });
    await queryInterface.addColumn('access_logs', 'scheduled_entry_date', { type: Sequelize.DATE });
    await queryInterface.addColumn('access_logs', 'scheduled_entry_end', { type: Sequelize.DATE });
    await queryInterface.addColumn('access_logs', 'scheduled_exit_date', { type: Sequelize.DATE });
    await queryInterface.addColumn('access_logs', 'scheduled_exit_end', { type: Sequelize.DATE });
    await queryInterface.addColumn('access_logs', 'scheduled_entry_time', { type: Sequelize.STRING });
    await queryInterface.addColumn('access_logs', 'scheduled_exit_time', { type: Sequelize.STRING });
    await queryInterface.addColumn('access_logs', 'vehicle_number', { type: Sequelize.STRING });
    await queryInterface.addColumn('access_logs', 'scanned_by', { type: Sequelize.UUID });
    await queryInterface.addColumn('access_logs', 'approved_at', { type: Sequelize.DATE });
    await queryInterface.addColumn('access_logs', 'actual_entry_time', { type: Sequelize.DATE });
    await queryInterface.addColumn('access_logs', 'actual_exit_time', { type: Sequelize.DATE });
    await queryInterface.addColumn('access_logs', 'remarks', { type: Sequelize.TEXT });
    await queryInterface.addColumn('access_logs', 'created_by', { type: Sequelize.UUID });
    await queryInterface.addColumn('access_logs', 'deleted_at', { type: Sequelize.DATE });
    await queryInterface.addColumn('access_logs', 'unit_id', { type: Sequelize.UUID });
    await queryInterface.addColumn('access_logs', 'entry_gate_id', { type: Sequelize.UUID });
    await queryInterface.addColumn('access_logs', 'exit_gate_id', { type: Sequelize.UUID });
    await queryInterface.addColumn('access_logs', 'verification_method', { 
      type: Sequelize.ENUM('rfid', 'qr_code', 'access_code', 'biometric', 'manual')
    });
    
    await queryInterface.addIndex('access_logs', ['actual_entry_time']);
  }
};
