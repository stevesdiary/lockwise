'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('newsletter_subscribers', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      first_name: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('subscribed', 'unsubscribed'),
        allowNull: false,
        defaultValue: 'subscribed',
      },
      source: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'landing_page',
      },
      subscribed_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
      unsubscribed_at: {
        type: Sequelize.DATE,
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

    await queryInterface.addIndex('newsletter_subscribers', ['email'], { unique: true });
    await queryInterface.addIndex('newsletter_subscribers', ['status']);
    await queryInterface.addIndex('newsletter_subscribers', ['source']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('newsletter_subscribers');
  },
};
