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
      { id: randomUUID(), action: 'approve', description: 'Approve or reject items' },
      { id: randomUUID(), action: 'read', description: 'View and read access' },
      { id: randomUUID(), action: 'create', description: 'Create new items' },
      { id: randomUUID(), action: 'update', description: 'Modify existing items' },
      { id: randomUUID(), action: 'delete', description: 'Remove items' }
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
