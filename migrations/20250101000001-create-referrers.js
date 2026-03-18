'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('referrers', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      referral_code: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false
      },
      total_earnings: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    }, { ifNotExists: true });

    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "referrers_referral_code" ON "referrers" ("referral_code")');
    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "referrers_email" ON "referrers" ("email")');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('referrers');
  }
};