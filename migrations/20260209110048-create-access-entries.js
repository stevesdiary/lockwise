'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('access_entries', {
      entry_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      access_log_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'access_logs',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      entry_time: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },
      exit_time: {
        type: Sequelize.DATE,
        allowNull: true
      },
      gate_id: {
        type: Sequelize.STRING,
        allowNull: true
      },
      scanned_by: {
        type: Sequelize.STRING,
        allowNull: true
      },
      remarks: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      }
    }, { ifNotExists: true });

    // Add indexes for performance
    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "access_entries_access_log_id" ON "access_entries" ("access_log_id")');
    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "access_entries_entry_time" ON "access_entries" ("entry_time")');
    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "access_entries_gate_id" ON "access_entries" ("gate_id")');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('access_entries');
  }
};
