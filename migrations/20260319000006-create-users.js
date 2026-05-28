'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      title: { type: Sequelize.STRING, allowNull: true },
      first_name: { type: Sequelize.STRING, allowNull: true },
      last_name: { type: Sequelize.STRING, allowNull: true },
      phone: { type: Sequelize.STRING, allowNull: true },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      password: { type: Sequelize.STRING, allowNull: true },
      google_id: { type: Sequelize.STRING, allowNull: true, unique: true },
      oauth_enabled: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      verified: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      reset_token: { type: Sequelize.STRING, allowNull: true },
      reset_expires: { type: Sequelize.DATE, allowNull: true },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'suspended', 'pending'),
        allowNull: false,
        defaultValue: 'pending',
      },
      // Stored as STRING (not enum) to allow flexibility across roles
      user_type: { type: Sequelize.STRING, allowNull: true },
      profile_picture: { type: Sequelize.STRING, allowNull: true },
      role_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'roles', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      estate_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'estates', key: 'estate_id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
      deleted_at: { type: Sequelize.DATE, allowNull: true },
    });

    await queryInterface.addIndex('users', ['email']);
    await queryInterface.addIndex('users', ['role_id']);
    await queryInterface.addIndex('users', ['estate_id']);
    await queryInterface.addIndex('users', ['status']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('users');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_status"');
  },
};
