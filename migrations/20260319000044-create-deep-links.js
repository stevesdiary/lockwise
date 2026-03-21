'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('deep_links', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      link_type: { type: Sequelize.STRING, allowNull: false },
      target_id: { type: Sequelize.STRING, allowNull: true },
      url: { type: Sequelize.TEXT, allowNull: false },
      expires_at: { type: Sequelize.DATE, allowNull: true },
      clicks: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      created_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('deep_links', ['user_id']);
    await queryInterface.addIndex('deep_links', ['link_type']);
    await queryInterface.addIndex('deep_links', ['expires_at']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('deep_links');
  },
};
