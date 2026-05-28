'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('bulk_upload_jobs', {
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
      upload_type: {
        type: Sequelize.ENUM('estates', 'residents', 'addresses'),
        allowNull: false,
      },
      filename: { type: Sequelize.STRING, allowNull: false },
      status: {
        type: Sequelize.ENUM('processing', 'completed', 'failed'),
        allowNull: false,
        defaultValue: 'processing',
      },
      total_processed: { type: Sequelize.INTEGER, allowNull: true, defaultValue: 0 },
      success_count: { type: Sequelize.INTEGER, allowNull: true, defaultValue: 0 },
      error_count: { type: Sequelize.INTEGER, allowNull: true, defaultValue: 0 },
      skipped_count: { type: Sequelize.INTEGER, allowNull: true, defaultValue: 0 },
      source_file_key: { type: Sequelize.STRING, allowNull: true },
      source_file_url: { type: Sequelize.TEXT, allowNull: true },
      error_details: { type: Sequelize.JSONB, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('bulk_upload_jobs', ['user_id']);
    await queryInterface.addIndex('bulk_upload_jobs', ['status']);
    await queryInterface.addIndex('bulk_upload_jobs', ['upload_type']);
    await queryInterface.addIndex('bulk_upload_jobs', ['created_at']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('bulk_upload_jobs');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_bulk_upload_jobs_upload_type"');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_bulk_upload_jobs_status"');
  },
};
