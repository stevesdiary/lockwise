'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable('access_logs', {
      id: {
        PrimaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        reference: {
          model: 'user',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET_NULL'
      },
      estate_id: {
        type: Sequelize.UUID,
        allowNull: false,
        reference: {
          module: 'estates',
          key: 'estate_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      access_code: {
        type: Sequelize.STRING
      },
      exit_code: {
        type: Sequelize.STRING
      },
      set_date_in: {
        type: Sequelize.DATE
      },
      set_date_out: {
        type: Sequelize.DATE
      },
      set_entry_time: {
        type: Sequelize.STRING
      },
      set_exit_time: {
        type: Sequelize.STRING
      },
      entry_date: {
        type: Sequelize.DATE
      },
      exit_date: {
        type: Sequelize.DATE
      },
      vehicle_number: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING
      },
      remarks: {
        type: Sequelize.STRING
      },
      is_multi_entry: {
        type: Sequelize.BOOLEAN,
      },
      created_by: {
        type: Sequelize.STRING
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    })
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable('access_logs')
  }
};
