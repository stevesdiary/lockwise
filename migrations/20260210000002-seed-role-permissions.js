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

    const { approve: APPROVE, read: READ, create: CREATE, update: UPDATE, delete: DELETE } = permMap;

    const roles = await queryInterface.sequelize.query(
      'SELECT id, role as name FROM roles',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const roleMap = roles.reduce((acc, role) => {
      acc[role.name] = role.id;
      return acc;
    }, {});

    const rolePermissions = [];
    const addPermissions = (roleId, permIds) => {
      permIds.forEach(permId => {
        rolePermissions.push({
          id: queryInterface.sequelize.fn('gen_random_uuid'),
          role_id: roleId,
          permission_id: permId,
          created_at: new Date(),
          updated_at: new Date()
        });
      });
    };

    if (roleMap.super_admin) addPermissions(roleMap.super_admin, [APPROVE, READ, CREATE, UPDATE, DELETE]);
    if (roleMap.master) addPermissions(roleMap.master, [APPROVE, READ, CREATE, UPDATE, DELETE]);
    if (roleMap.admin) addPermissions(roleMap.admin, [APPROVE, READ, CREATE, UPDATE]);
    if (roleMap.manager) addPermissions(roleMap.manager, [READ, CREATE, UPDATE]);
    if (roleMap.security) addPermissions(roleMap.security, [READ, CREATE]);
    if (roleMap.resident) addPermissions(roleMap.resident, [READ, CREATE]);
    if (roleMap.domestic_staff) addPermissions(roleMap.domestic_staff, [READ]);
    if (roleMap.customer_service) addPermissions(roleMap.customer_service, [READ, CREATE, UPDATE]);

    await queryInterface.bulkInsert('role_permissions', rolePermissions);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('role_permissions', null, {});
  }
};
