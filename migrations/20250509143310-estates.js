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
    await queryInterface.createTable('estates', {
      estate_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true
      },
      // resident_id: {
      //   type: Sequelize.UUID,
      //   allowNull: false,
      //   references: {
      //     model: 'residents',
      //     key: 'resident_id'
      //   },
      //   onUpdate: 'CASCADE',
      //   onDelete: 'SET NULL'
      // },
      // user_id: {
      //   type: Sequelize.UUID,
      //   allowNull: false,
      //   references: {
      //     model: 'users',
      //     key: 'user_id'
      //   },
      //   onUpdate: 'CASCADE',
      //   onDelete: 'SET NULL'
      // },
      status: {
        type: Sequelize.STRING
      },
      estate_approval_status: {
        type: Sequelize.STRING,
        defaultValue: 'pending'
      },
      estate_approval_status_reason: {
        type: Sequelize.STRING,
        allowNull: true
      },
      approved_on: {
        type: Sequelize.DATE
      },
      approved_by: {
        type: Sequelize.STRING
      },
      name: {
        type: Sequelize.STRING
      },
      estate_code: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      address: {
        type: Sequelize.STRING
      },
      contact_phone: {
        type: Sequelize.STRING
      },
      contact_email: {
        type: Sequelize.STRING
      },
      type: {
        type: Sequelize.STRING
      },
      total_number_of_staff: {
        type: Sequelize.INTEGER
      },
      total_floors: {
        type: Sequelize.INTEGER
      },
      total_number_of_apartments: {
        type: Sequelize.INTEGER
      },
      total_parking_spaces: {
        type: Sequelize.INTEGER
      },
      city: {
        type: Sequelize.STRING
      },
      zip_code: {
        type: Sequelize.STRING
      },
      state: {
        type: Sequelize.STRING
      },
      country: {
        type: Sequelize.STRING,
        allowNull: false
      },
      subscribed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      subscribed_on: {
        type: Sequelize.DATE
      },
      active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      subscription_type: {
        type: Sequelize.STRING
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
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable('estates');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS estate_status');
  }
};
