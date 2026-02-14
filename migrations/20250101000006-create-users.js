'use strict';

const { stat } = require('fs');
const { type } = require('os');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      title: {
        type: Sequelize.STRING
      },
      first_name: {
        type: Sequelize.STRING,
      },
      last_name: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.STRING
      },
      phone: {
        type: Sequelize.STRING
      },
      verified: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING
      },
      user_type: {
        type: Sequelize.STRING,
        allowNull: true
      },
      reset_token: {
        type: Sequelize.STRING,
        allowNull: true
      },
      reset_token_expires: {
        type: Sequelize.DATE,
        allowNull: true
      },
      verification_code: {
        type: Sequelize.STRING,
        allowNull: true
      },
      verification_expires: {
        type: Sequelize.DATE,
        allowNull: true
      },
      google_id: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
      },
      role_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'roles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      estate_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'estates',
          key: 'estate_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      deleted_at: {
        type: Sequelize.DATE
      }
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
};
