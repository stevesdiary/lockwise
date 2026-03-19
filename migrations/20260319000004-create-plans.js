'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('plans', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: { type: Sequelize.STRING, allowNull: false, unique: true },
      description: { type: Sequelize.TEXT, allowNull: true },
      billing_cycle: {
        type: Sequelize.ENUM('monthly', 'quarterly', 'biannually', 'annually'),
        allowNull: false,
        defaultValue: 'monthly',
      },
      category: {
        type: Sequelize.ENUM('basic', 'standard', 'premium'),
        allowNull: false,
        defaultValue: 'basic',
      },
      features: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: { access: ['access_code'], amenities: [], services: ['customer_support'] },
      },
      duration: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 30 },
      price: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      price_paid: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      currency: { type: Sequelize.STRING, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('plans');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_plans_billing_cycle"');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_plans_category"');
  },
};
