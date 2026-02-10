'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('amenities', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      estate_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'estates', key: 'id' }, onDelete: 'CASCADE' },
      name: { type: Sequelize.STRING(100), allowNull: false },
      description: { type: Sequelize.TEXT },
      type: { type: Sequelize.STRING(50), allowNull: false },
      capacity: { type: Sequelize.INTEGER },
      hourly_rate: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
      status: { type: Sequelize.STRING(20), defaultValue: 'active' },
      operating_hours: { type: Sequelize.JSONB },
      rules: { type: Sequelize.TEXT },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    await queryInterface.createTable('reservations', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      amenity_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'amenities', key: 'id' }, onDelete: 'CASCADE' },
      user_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      start_time: { type: Sequelize.DATE, allowNull: false },
      end_time: { type: Sequelize.DATE, allowNull: false },
      status: { type: Sequelize.STRING(20), defaultValue: 'pending' },
      guests_count: { type: Sequelize.INTEGER, defaultValue: 1 },
      total_amount: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
      payment_status: { type: Sequelize.STRING(20), defaultValue: 'unpaid' },
      notes: { type: Sequelize.TEXT },
      cancelled_reason: { type: Sequelize.TEXT },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    await queryInterface.addIndex('amenities', ['estate_id'], { name: 'idx_amenities_estate' });
    await queryInterface.addIndex('amenities', ['status'], { name: 'idx_amenities_status' });
    await queryInterface.addIndex('reservations', ['amenity_id'], { name: 'idx_reservations_amenity' });
    await queryInterface.addIndex('reservations', ['user_id'], { name: 'idx_reservations_user' });
    await queryInterface.addIndex('reservations', ['start_time', 'end_time'], { name: 'idx_reservations_time' });
    await queryInterface.addIndex('reservations', ['status'], { name: 'idx_reservations_status' });

    await queryInterface.addIndex('reservations', ['amenity_id', 'start_time', 'end_time'], {
      name: 'idx_no_overlap',
      unique: true,
      where: { status: ['pending', 'confirmed'] }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('reservations');
    await queryInterface.dropTable('amenities');
  }
};
