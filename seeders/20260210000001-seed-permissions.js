'use strict';
const { randomUUID } = require('crypto');

module.exports = {
  up: async (queryInterface) => {
    const existingPerms = await queryInterface.sequelize.query(
      'SELECT action FROM permissions',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const existingActions = existingPerms.map(p => p.action);

    const permissions = [
      // Estate permissions
      { id: randomUUID(), action: 'approve:estates', description: 'Approve estate registrations' },
      { id: randomUUID(), action: 'read:estates', description: 'View estates' },
      { id: randomUUID(), action: 'create:estates', description: 'Create estates' },
      { id: randomUUID(), action: 'update:estates', description: 'Update estates' },
      { id: randomUUID(), action: 'delete:estates', description: 'Delete estates' },
      
      // User permissions
      { id: randomUUID(), action: 'read:users', description: 'View users' },
      { id: randomUUID(), action: 'create:users', description: 'Create users' },
      { id: randomUUID(), action: 'update:users', description: 'Update users' },
      { id: randomUUID(), action: 'delete:users', description: 'Delete users' },
      { id: randomUUID(), action: 'assign:roles', description: 'Assign roles to users' },
      
      // Access/Gate permissions
      { id: randomUUID(), action: 'approve:access', description: 'Approve gate access/guest entry' },
      { id: randomUUID(), action: 'read:access', description: 'View access logs' },
      { id: randomUUID(), action: 'create:access', description: 'Create access codes' },
      { id: randomUUID(), action: 'update:access', description: 'Update access records' },
      
      // Resident permissions
      { id: randomUUID(), action: 'read:residents', description: 'View residents' },
      { id: randomUUID(), action: 'create:residents', description: 'Add residents' },
      { id: randomUUID(), action: 'update:residents', description: 'Update residents' },
      { id: randomUUID(), action: 'delete:residents', description: 'Remove residents' },
      
      // Payment permissions
      { id: randomUUID(), action: 'read:payments', description: 'View payments' },
      { id: randomUUID(), action: 'create:payments', description: 'Process payments' },
      { id: randomUUID(), action: 'approve:payments', description: 'Approve payments' },
      
      // Analytics permissions
      { id: randomUUID(), action: 'read:analytics', description: 'View analytics/reports' },
      
      // Support permissions
      { id: randomUUID(), action: 'read:support', description: 'View support tickets' },
      { id: randomUUID(), action: 'create:support', description: 'Create support tickets' },
      { id: randomUUID(), action: 'update:support', description: 'Update support tickets' }
    ].filter(p => !existingActions.includes(p.action));

    if (permissions.length > 0) {
      await queryInterface.bulkInsert('permissions', permissions.map(p => ({
        ...p,
        created_at: new Date(),
        updated_at: new Date()
      })));
    }
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('permissions', null, {});
  }
};
