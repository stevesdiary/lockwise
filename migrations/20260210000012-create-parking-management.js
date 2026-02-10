'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('parking_slots', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      estate_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'estates', key: 'id' }, onDelete: 'CASCADE' },
      slot_number: { type: Sequelize.STRING(20), allowNull: false },
      slot_type: { type: Sequelize.STRING(20), defaultValue: 'regular' },
      location: { type: Sequelize.STRING(100) },
      status: { type: Sequelize.STRING(20), defaultValue: 'available' },
      has_ev_charger: { type: Sequelize.BOOLEAN, defaultValue: false },
      charger_type: { type: Sequelize.STRING(20) },
      charger_power: { type: Sequelize.INTEGER },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    await queryInterface.addConstraint('parking_slots', {
      fields: ['estate_id', 'slot_number'],
      type: 'unique',
      name: 'parking_slots_estate_id_slot_number_unique'
    });

    await queryInterface.createTable('parking_assignments', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      slot_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'parking_slots', key: 'id' }, onDelete: 'CASCADE', unique: true },
      user_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      vehicle_plate: { type: Sequelize.STRING(20) },
      vehicle_model: { type: Sequelize.STRING(50) },
      assigned_date: { type: Sequelize.DATEONLY, defaultValue: Sequelize.literal('CURRENT_DATE') },
      status: { type: Sequelize.STRING(20), defaultValue: 'active' },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    await queryInterface.createTable('guest_parking', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      slot_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'parking_slots', key: 'id' }, onDelete: 'CASCADE' },
      owner_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      guest_name: { type: Sequelize.STRING(100), allowNull: false },
      guest_phone: { type: Sequelize.STRING(20), allowNull: false },
      guest_vehicle_plate: { type: Sequelize.STRING(20) },
      start_time: { type: Sequelize.DATE, allowNull: false },
      end_time: { type: Sequelize.DATE, allowNull: false },
      status: { type: Sequelize.STRING(20), defaultValue: 'active' },
      access_code: { type: Sequelize.STRING(10) },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    await queryInterface.createTable('ev_charging_sessions', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      slot_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'parking_slots', key: 'id' }, onDelete: 'CASCADE' },
      user_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      start_time: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      end_time: { type: Sequelize.DATE },
      energy_consumed: { type: Sequelize.DECIMAL(10, 2) },
      rate_per_kwh: { type: Sequelize.DECIMAL(10, 2), defaultValue: 50.00 },
      total_cost: { type: Sequelize.DECIMAL(10, 2) },
      payment_status: { type: Sequelize.STRING(20), defaultValue: 'pending' },
      payment_id: { type: Sequelize.UUID, references: { model: 'payments', key: 'id' } },
      status: { type: Sequelize.STRING(20), defaultValue: 'active' },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    await queryInterface.addIndex('parking_slots', ['estate_id'], { name: 'idx_parking_slots_estate' });
    await queryInterface.addIndex('parking_slots', ['status'], { name: 'idx_parking_slots_status' });
    await queryInterface.addIndex('parking_assignments', ['user_id'], { name: 'idx_parking_assignments_user' });
    await queryInterface.addIndex('parking_assignments', ['slot_id'], { name: 'idx_parking_assignments_slot' });
    await queryInterface.addIndex('guest_parking', ['owner_id'], { name: 'idx_guest_parking_owner' });
    await queryInterface.addIndex('guest_parking', ['start_time', 'end_time'], { name: 'idx_guest_parking_time' });
    await queryInterface.addIndex('ev_charging_sessions', ['user_id'], { name: 'idx_ev_sessions_user' });
    await queryInterface.addIndex('ev_charging_sessions', ['slot_id'], { name: 'idx_ev_sessions_slot' });
    await queryInterface.addIndex('ev_charging_sessions', ['status'], { name: 'idx_ev_sessions_status' });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('ev_charging_sessions');
    await queryInterface.dropTable('guest_parking');
    await queryInterface.dropTable('parking_assignments');
    await queryInterface.dropTable('parking_slots');
  }
};
