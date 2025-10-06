'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if role_id column exists in permissions table before removing
    const permissionTableInfo = await queryInterface.describeTable('permissions');
    if (permissionTableInfo.role_id) {
      await queryInterface.removeColumn('permissions', 'role_id');
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Add back role_id column if needed
    await queryInterface.addColumn('permissions', 'role_id', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'roles',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
  }
};