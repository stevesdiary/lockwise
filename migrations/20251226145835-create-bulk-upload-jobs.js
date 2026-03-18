'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Bulk upload jobs table
    await queryInterface.createTable('bulk_upload_jobs', {
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
      upload_type: {
        type: Sequelize.ENUM('estates', 'residents', 'addresses'),
        allowNull: false
      },
      filename: {
        type: Sequelize.STRING,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('processing', 'completed', 'failed'),
        defaultValue: 'processing'
      },
      total_processed: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      success_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      error_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      skipped_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      source_file_key: {
        type: Sequelize.STRING,
        allowNull: true
      },
      source_file_url: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      error_details: {
        type: Sequelize.JSONB
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
    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "bulk_upload_jobs_user_id" ON "bulk_upload_jobs" ("user_id")');
    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "bulk_upload_jobs_upload_type" ON "bulk_upload_jobs" ("upload_type")');
    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "bulk_upload_jobs_status" ON "bulk_upload_jobs" ("status")');
    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "bulk_upload_jobs_created_at" ON "bulk_upload_jobs" ("created_at")');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('bulk_upload_jobs');
  }
};