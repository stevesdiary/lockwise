'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('access_entries', {
      entry_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      access_log_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'access_logs', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      entry_time: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      exit_time: { type: Sequelize.DATE, allowNull: true },
      gate_id: { type: Sequelize.UUID, allowNull: true },
      scanned_by: { type: Sequelize.UUID, allowNull: true },
      remarks: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('access_entries', ['access_log_id']);
    await queryInterface.addIndex('access_entries', ['entry_time']);
    await queryInterface.addIndex('access_entries', ['gate_id']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('access_entries');
  },
};
