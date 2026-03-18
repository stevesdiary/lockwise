'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // File uploads table
    await queryInterface.createTable('file_uploads', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      estate_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'estates',
          key: 'estate_id'
        },
        onDelete: 'CASCADE'
      },
      filename: {
        type: Sequelize.STRING,
        allowNull: false
      },
      original_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      file_key: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      file_url: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      thumbnail_url: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      file_size: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      mime_type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      upload_type: {
        type: Sequelize.ENUM('document', 'image', 'general'),
        defaultValue: 'general'
      },
      folder: {
        type: Sequelize.STRING,
        defaultValue: 'general'
      },
      is_public: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    }, { ifNotExists: true });

    // Add indexes
    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "file_uploads_user_id" ON "file_uploads" ("user_id")');
    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "file_uploads_estate_id" ON "file_uploads" ("estate_id")');
    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "file_uploads_file_key" ON "file_uploads" ("file_key")');
    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "file_uploads_upload_type" ON "file_uploads" ("upload_type")');
    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "file_uploads_created_at" ON "file_uploads" ("created_at")');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('file_uploads');
  }
};