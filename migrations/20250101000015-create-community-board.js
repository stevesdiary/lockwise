'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create community_posts table
    await queryInterface.createTable('community_posts', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      estate_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'estates',
          key: 'estate_id'
        }
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      type: {
        type: Sequelize.ENUM('announcement', 'chat', 'meeting', 'event', 'alert'),
        allowNull: false
      },
      title: {
        type: Sequelize.STRING,
        allowNull: true
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      attachments: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      is_pinned: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
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

    // Create community_comments table
    await queryInterface.createTable('community_comments', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      post_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'community_posts',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
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

    // Add indexes
    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "community_posts_estate_id" ON "community_posts" ("estate_id")');
    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "community_posts_type" ON "community_posts" ("type")');
    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "community_posts_is_pinned" ON "community_posts" ("is_pinned")');
    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "community_posts_created_at" ON "community_posts" ("created_at")');
    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "community_comments_post_id" ON "community_comments" ("post_id")');
    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "community_comments_created_at" ON "community_comments" ("created_at")');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('community_comments');
    await queryInterface.dropTable('community_posts');
  }
};