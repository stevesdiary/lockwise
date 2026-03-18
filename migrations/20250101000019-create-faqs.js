'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('faqs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      question: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      answer: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      category: {
        type: Sequelize.ENUM('general', 'access_codes', 'payments', 'security', 'technical'),
        allowNull: false,
        defaultValue: 'general'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      order_index: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      created_by: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
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
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    }, { ifNotExists: true });

    // Add indexes
    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "faqs_category" ON "faqs" ("category")');
    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "faqs_is_active" ON "faqs" ("is_active")');
    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "faqs_order_index" ON "faqs" ("order_index")');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('faqs');
  }
};