'use strict';

module.exports = {
  up: async (queryInterface) => {
    const permissions = await queryInterface.sequelize.query(
      'SELECT id, action FROM permissions',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const permMap = permissions.reduce((acc, perm) => {
      acc[perm.action] = perm.id;
      return acc;
    }, {});

    const roles = await queryInterface.sequelize.query(
      'SELECT id, role as name FROM roles',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const roleMap = roles.reduce((acc, role) => {
      acc[role.name] = role.id;
      return acc;
    }, {});

    const rolePermissions = [];
    const addPermissions = (roleId, permActions) => {
      permActions.forEach(action => {
        if (permMap[action]) {
          rolePermissions.push({
            id: queryInterface.sequelize.fn('gen_random_uuid'),
            role_id: roleId,
            permission_id: permMap[action],
            created_at: new Date(),
            updated_at: new Date()
          });
        }
      });
    };

    // Master - Full system access
    if (roleMap.master) addPermissions(roleMap.master, [
      'approve:estates', 'read:estates', 'create:estates', 'update:estates', 'delete:estates',
      'read:users', 'create:users', 'update:users', 'delete:users', 'assign:roles',
      'approve:access', 'read:access', 'create:access', 'update:access',
      'read:residents', 'create:residents', 'update:residents', 'delete:residents',
      'read:payments', 'create:payments', 'approve:payments',
      'read:analytics',
      'read:support', 'create:support', 'update:support'
    ]);

    // Admin - Manage all estates
    if (roleMap.admin) addPermissions(roleMap.admin, [
      'read:estates', 'create:estates', 'update:estates', 'delete:estates',
      'read:users', 'create:users', 'update:users', 'delete:users',
      'read:access', 'create:access', 'update:access',
      'read:residents', 'create:residents', 'update:residents', 'delete:residents',
      'read:payments', 'create:payments',
      'read:analytics',
      'read:support', 'update:support'
    ]);

    // Manager - Manage own estate only
    if (roleMap.manager) addPermissions(roleMap.manager, [
      'read:estates', 'update:estates',
      'read:users', 'create:users', 'update:users',
      'read:access', 'create:access', 'update:access',
      'read:residents', 'create:residents', 'update:residents',
      'read:payments',
      'read:analytics',
      'read:support', 'create:support'
    ]);

    // Security - Gate operations
    if (roleMap.security) addPermissions(roleMap.security, [
      'approve:access', 'read:access', 'create:access',
      'read:residents',
      'create:support'
    ]);

    // Resident - Basic access
    if (roleMap.resident) addPermissions(roleMap.resident, [
      'read:access', 'create:access',
      'read:payments', 'create:payments',
      'create:support'
    ]);

    // Staff - View only
    if (roleMap.staff) addPermissions(roleMap.staff, [
      'read:access',
      'create:support'
    ]);

    // Customer Support
    if (roleMap.customer_support) addPermissions(roleMap.customer_support, [
      'read:estates', 'read:users', 'read:residents',
      'read:access', 'read:payments',
      'read:support', 'create:support', 'update:support'
    ]);

    if (rolePermissions.length > 0) {
      const values = rolePermissions
        .filter(r => r.role_id && r.permission_id)
        .map(r => `(gen_random_uuid(), '${r.role_id}', '${r.permission_id}', NOW(), NOW())`)
        .join(',');
      if (values) {
        await queryInterface.sequelize.query(
          `INSERT INTO role_permissions (id, role_id, permission_id, created_at, updated_at) VALUES ${values} ON CONFLICT (role_id, permission_id) DO NOTHING`
        );
      }
    }
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('role_permissions', null, {});
  }
};
