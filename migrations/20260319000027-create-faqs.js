'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('faqs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      question: { type: Sequelize.TEXT, allowNull: false },
      answer: { type: Sequelize.TEXT, allowNull: false },
      category: {
        type: Sequelize.ENUM('general', 'access_codes', 'payments', 'security', 'technical'),
        allowNull: false,
        defaultValue: 'general',
      },
      is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      order_index: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      created_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
      deleted_at: { type: Sequelize.DATE, allowNull: true },
    });

    await queryInterface.addIndex('faqs', ['category']);
    await queryInterface.addIndex('faqs', ['is_active']);
    await queryInterface.addIndex('faqs', ['order_index']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('faqs');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_faqs_category"');
  },
};
