'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('access_entries', {
      entry_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      access_log_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'access_logs',
          key: 'log_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      entry_time: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      exit_time: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      scanned_by: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      gate_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE,
      deleted_at: Sequelize.DATE, // for paranoid mode
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('access_entries');
  },
};
