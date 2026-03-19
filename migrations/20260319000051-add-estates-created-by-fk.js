'use strict';

// Deferred FK: adds the FK constraint for estates.created_by → users.id
// (could not be added during estate table creation due to circular dependency)

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint('estates', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_estates_created_by',
      references: { table: 'users', field: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeConstraint('estates', 'fk_estates_created_by');
  },
};
