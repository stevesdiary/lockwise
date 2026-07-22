'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('demo_requests', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      phone: {
        type: Sequelize.STRING(30),
        allowNull: true,
      },
      company: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      estate_size: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('pending', 'contacted', 'scheduled', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending',
      },
      contacted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    await queryInterface.addIndex('demo_requests', ['status']);
    await queryInterface.addIndex('demo_requests', ['email']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('demo_requests');
  },
};
