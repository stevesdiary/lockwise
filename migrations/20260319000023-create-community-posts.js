'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('community_posts', {
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
      type: {
        type: Sequelize.ENUM('announcement', 'chat', 'meeting', 'event', 'alert'),
        allowNull: false,
      },
      title: { type: Sequelize.STRING, allowNull: true },
      content: { type: Sequelize.TEXT, allowNull: false },
      attachments: { type: Sequelize.JSONB, allowNull: true },
      is_pinned: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('community_posts', ['estate_id']);
    await queryInterface.addIndex('community_posts', ['user_id']);
    await queryInterface.addIndex('community_posts', ['type']);
    await queryInterface.addIndex('community_posts', ['is_pinned']);
    await queryInterface.addIndex('community_posts', ['created_at']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('community_posts');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_community_posts_type"');
  },
};
