'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint('estates', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'estates_created_by_fkey',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('estates', 'estates_created_by_fkey');
  }
};
