'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Both support_tickets and support_messages already exist from 20250101000014-create-emergency-features.js
    // Nothing to do
  },

  down: async (queryInterface, Sequelize) => {
    // Nothing to rollback
  }
};
