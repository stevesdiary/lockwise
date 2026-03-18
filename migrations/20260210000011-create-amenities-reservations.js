'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('amenities', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      estate_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'estates', key: 'estate_id' }, onDelete: 'CASCADE' },
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
    }, { ifNotExists: true });

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
    }, { ifNotExists: true });

    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "idx_amenities_estate" ON "amenities" ("estate_id")');
    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "idx_amenities_status" ON "amenities" ("status")');
    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "idx_reservations_amenity" ON "reservations" ("amenity_id")');
    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "idx_reservations_user" ON "reservations" ("user_id")');
    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "idx_reservations_time" ON "reservations" ("start_time", "end_time")');
    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "idx_reservations_status" ON "reservations" ("status")');

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
