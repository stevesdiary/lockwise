'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('message_reactions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      message_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'community_messages', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      emoji: { type: Sequelize.STRING(10), allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('message_reactions', ['message_id']);
    await queryInterface.addIndex('message_reactions', ['user_id']);
    // One reaction per emoji per user per message
    await queryInterface.addIndex('message_reactions', ['message_id', 'user_id', 'emoji'], { unique: true });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('message_reactions');
  },
};
