'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('file_uploads', {
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
      estate_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'estates', key: 'estate_id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      filename: { type: Sequelize.STRING, allowNull: false },
      original_name: { type: Sequelize.STRING, allowNull: true },
      file_key: { type: Sequelize.STRING, allowNull: false, unique: true },
      file_url: { type: Sequelize.TEXT, allowNull: true },
      thumbnail_url: { type: Sequelize.TEXT, allowNull: true },
      file_size: { type: Sequelize.INTEGER, allowNull: true },
      mime_type: { type: Sequelize.STRING, allowNull: true },
      upload_type: {
        type: Sequelize.ENUM('document', 'image', 'general'),
        allowNull: false,
        defaultValue: 'general',
      },
      folder: { type: Sequelize.STRING, allowNull: true, defaultValue: 'general' },
      is_public: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('file_uploads', ['user_id']);
    await queryInterface.addIndex('file_uploads', ['estate_id']);
    await queryInterface.addIndex('file_uploads', ['file_key']);
    await queryInterface.addIndex('file_uploads', ['upload_type']);
    await queryInterface.addIndex('file_uploads', ['created_at']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('file_uploads');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_file_uploads_upload_type"');
  },
};
