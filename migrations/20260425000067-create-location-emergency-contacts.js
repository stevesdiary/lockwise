'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('emergency_contact_categories', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      name: { type: Sequelize.STRING(100), allowNull: false },
      icon: { type: Sequelize.STRING(50), allowNull: true },
      priority: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 100 },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });

    await queryInterface.createTable('countries', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      name: { type: Sequelize.STRING(100), allowNull: false },
      iso_code: { type: Sequelize.CHAR(2), allowNull: false, unique: true },
      phone_prefix: { type: Sequelize.STRING(10), allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });

    await queryInterface.createTable('states', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      country_id: {
        type: Sequelize.UUID, allowNull: false,
        references: { model: 'countries', key: 'id' },
        onDelete: 'CASCADE',
      },
      name: { type: Sequelize.STRING(100), allowNull: false },
      code: { type: Sequelize.STRING(10), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });

    await queryInterface.createTable('cities', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      state_id: {
        type: Sequelize.UUID, allowNull: false,
        references: { model: 'states', key: 'id' },
        onDelete: 'CASCADE',
      },
      name: { type: Sequelize.STRING(100), allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });

    await queryInterface.createTable('location_emergency_contacts', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      category_id: {
        type: Sequelize.UUID, allowNull: false,
        references: { model: 'emergency_contact_categories', key: 'id' },
        onDelete: 'CASCADE',
      },
      name: { type: Sequelize.STRING(200), allowNull: false },
      phone_number: { type: Sequelize.STRING(50), allowNull: false },
      alt_phone_number: { type: Sequelize.STRING(50), allowNull: true },
      country_id: {
        type: Sequelize.UUID, allowNull: false,
        references: { model: 'countries', key: 'id' },
        onDelete: 'CASCADE',
      },
      state_id: {
        type: Sequelize.UUID, allowNull: true,
        references: { model: 'states', key: 'id' },
        onDelete: 'SET NULL',
      },
      city_id: {
        type: Sequelize.UUID, allowNull: true,
        references: { model: 'cities', key: 'id' },
        onDelete: 'SET NULL',
      },
      description: { type: Sequelize.TEXT, allowNull: true },
      is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      priority: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 100 },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });

    await queryInterface.addIndex('location_emergency_contacts', ['country_id', 'state_id', 'city_id'], {
      name: 'idx_location_emergency_contacts_location',
    });
    await queryInterface.addIndex('location_emergency_contacts', ['category_id'], {
      name: 'idx_location_emergency_contacts_category',
    });
    await queryInterface.addIndex('states', ['country_id'], { name: 'idx_states_country' });
    await queryInterface.addIndex('cities', ['state_id'], { name: 'idx_cities_state' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('location_emergency_contacts');
    await queryInterface.dropTable('cities');
    await queryInterface.dropTable('states');
    await queryInterface.dropTable('countries');
    await queryInterface.dropTable('emergency_contact_categories');
  },
};
