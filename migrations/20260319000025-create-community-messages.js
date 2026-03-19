'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('community_messages', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      estate_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'estates', key: 'estate_id' },
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
      message: { type: Sequelize.TEXT, allowNull: false },
      file_url: { type: Sequelize.STRING, allowNull: true },
      file_name: { type: Sequelize.STRING, allowNull: true },
      file_type: { type: Sequelize.STRING, allowNull: true },
      file_size: { type: Sequelize.INTEGER, allowNull: true },
      is_announcement: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('community_messages', ['estate_id']);
    await queryInterface.addIndex('community_messages', ['user_id']);
    await queryInterface.addIndex('community_messages', ['created_at']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('community_messages');
  },
};
