'use strict';

// NOTE: estates.created_by and estates.approved_by are plain UUIDs here (no FK) due to
// circular dependency with users. The FK for created_by is added in 20260319000051.

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('estates', {
      estate_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      estate_code: { type: Sequelize.STRING, allowNull: false, unique: true },
      name: { type: Sequelize.STRING, allowNull: false },
      type: {
        type: Sequelize.ENUM('residential', 'mixed', 'other', 'commercial'),
        allowNull: true,
      },
      city: { type: Sequelize.STRING, allowNull: true },
      state: { type: Sequelize.STRING, allowNull: true },
      country: { type: Sequelize.STRING, allowNull: true },
      country_code: { type: Sequelize.STRING(2), allowNull: false, defaultValue: 'NG' },
      timezone: { type: Sequelize.STRING, allowNull: false, defaultValue: 'Africa/Lagos' },
      currency_code: { type: Sequelize.STRING(3), allowNull: false, defaultValue: 'NGN' },
      location_details: { type: Sequelize.JSONB, allowNull: true, defaultValue: {} },
      access_points: { type: Sequelize.JSONB, allowNull: true, defaultValue: [] },
      geo_fencing: { type: Sequelize.JSONB, allowNull: true },
      total_number_of_apartments: { type: Sequelize.INTEGER, allowNull: true },
      total_floors: { type: Sequelize.INTEGER, allowNull: true },
      total_parking_spaces: { type: Sequelize.INTEGER, allowNull: true },
      number_of_staff: { type: Sequelize.INTEGER, allowNull: true },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'under_maintenance', 'suspended', 'pending'),
        allowNull: false,
        defaultValue: 'pending',
      },
      contact_info: { type: Sequelize.JSONB, allowNull: true, defaultValue: {} },
      approval_status: {
        type: Sequelize.ENUM('approved', 'pending', 'declined'),
        allowNull: false,
        defaultValue: 'pending',
      },
      approved_on: { type: Sequelize.DATE, allowNull: true },
      approved_by: { type: Sequelize.UUID, allowNull: true }, // FK added in 20260319000051
      referrer_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'referrers', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      plan_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'plans', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      created_by: { type: Sequelize.UUID, allowNull: true }, // FK added in 20260319000051
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
      deleted_at: { type: Sequelize.DATE, allowNull: true },
    });

    await queryInterface.addIndex('estates', ['estate_code']);
    await queryInterface.addIndex('estates', ['country_code']);
    await queryInterface.addIndex('estates', ['city', 'country_code']);
    await queryInterface.addIndex('estates', ['status']);
    await queryInterface.addIndex('estates', ['approval_status']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('estates');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_estates_type"');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_estates_status"');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_estates_approval_status"');
  },
};
