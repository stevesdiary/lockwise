'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('access_logs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },

      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },

      estate_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'estates',
          key: 'estate_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },

      // Access request fields
      access_code: Sequelize.STRING,
      exit_code: Sequelize.STRING,
      scheduled_entry_date: Sequelize.DATE,
      scheduled_entry_end: Sequelize.DATE,
      scheduled_exit_date: Sequelize.DATE,
      scheduled_exit_end: Sequelize.DATE,
      scheduled_entry_time: Sequelize.STRING,
      scheduled_exit_time: Sequelize.STRING,
      vehicle_number: Sequelize.STRING,
      
      // Approval fields
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected', 'expired'),
        defaultValue: 'pending'
      },
      approved_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      approved_at: Sequelize.DATE,
      
      // Actual entry/exit fields
      actual_entry_time: Sequelize.DATE,
      actual_exit_time: Sequelize.DATE,
      scanned_by: Sequelize.STRING,
      gate_id: Sequelize.STRING,
      
      // Additional fields
      is_multi_entry: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      max_entries: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      used_entries: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      valid_from: {
        type: Sequelize.DATE,
        allowNull: true
      },
      valid_until: {
        type: Sequelize.DATE,
        allowNull: true
      },
      remarks: Sequelize.TEXT,
      created_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
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
      },

      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // Add indexes for performance
    await queryInterface.addIndex('access_logs', ['user_id']);
    await queryInterface.addIndex('access_logs', ['estate_id']);
    await queryInterface.addIndex('access_logs', ['status']);
    await queryInterface.addIndex('access_logs', ['access_code']);
    await queryInterface.addIndex('access_logs', ['actual_entry_time']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('access_logs');
  }
};
