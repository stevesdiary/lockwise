import { Sequelize } from 'sequelize-typescript';
import { UserRole, Resource, Permission } from '../../src/modules/auth/types/user.types';
import { hashPassword } from './auth.helper';

/**
 * Seeds the database with initial test data
 * @param sequelize - Sequelize instance
 * @returns Object containing created test entities
 */
export const seedDatabase = async (sequelize: Sequelize) => {
  try {
    // Import models dynamically to avoid circular dependencies
    const { User } = await import('../../src/modules/auth/models/user.model');
    const { Role } = await import('../../src/modules/auth/models/role.model');
    const { Permission: PermissionModel } = await import('../../src/modules/auth/models/permission.model');
    const { Estate } = await import('../../src/modules/estate/models/estate.model');

    // Create roles if they don't exist
    const roles = await Promise.all(
      Object.values(UserRole).map((roleName) =>
        Role.findOrCreate({
          where: { role: roleName as any },
          defaults: {
            role: roleName as any,
          } as any,
        })
      )
    );

    // Create permissions if they don't exist
    const permissions: any[] = [];
    for (const resource of Object.values(Resource)) {
      for (const permission of Object.values(Permission)) {
        const [perm] = await PermissionModel.findOrCreate({
          where: { name: `${permission}_${resource}` },
          defaults: {
            name: `${permission}_${resource}`,
            description: `${permission} permission for ${resource}`,
          },
        });
        permissions.push(perm);
      }
    }

    // Create a test estate
    const [estate] = await Estate.findOrCreate({
      where: { estate_name: 'Test Estate' } as any,
      defaults: {
        name: 'Test Estate',
        address: '123 Test Street',
        city: 'Lagos',
        state: 'Lagos',
        country: 'Nigeria',
        zip_code: '100001',
        total_number_of_apartments: 50,
        total_floors: 5,
        total_parking_spaces: 30,
        status: 'active',
        approval_status: 'approved',
      } as any,
    });

    // Create test users for each role
    const testUsers: Record<string, any> = {};

    for (const roleName of Object.values(UserRole)) {
      const [user] = await User.findOrCreate({
        where: { email: `test_${roleName}@example.com` },
        defaults: {
          first_name: 'Test',
          last_name: roleName.replace('_', ' ').toUpperCase(),
          email: `test_${roleName}@example.com`,
          phone: `+2348012345${Math.floor(100 + Math.random() * 900)}`,
          password: await hashPassword('Test@Password123'),
          verified: true,
          status: 'active',
          estate_id: estate.estate_id,
        } as any,
      });
      testUsers[roleName] = user;
    }

    return {
      roles: roles.map(([role]) => role),
      permissions,
      estate,
      users: testUsers,
    };
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};

/**
 * Cleans all data from database tables
 * @param sequelize - Sequelize instance
 */
export const cleanupDatabase = async (sequelize: Sequelize): Promise<void> => {
  try {
    await sequelize.truncate({ cascade: true, force: true, restartIdentity: true });
  } catch (error) {
    console.error('Error cleaning database:', error);
    throw error;
  }
};

/**
 * Resets database to fresh state with seed data
 * @param sequelize - Sequelize instance
 * @returns Seeded test data
 */
export const resetDatabase = async (sequelize: Sequelize) => {
  await cleanupDatabase(sequelize);
  return seedDatabase(sequelize);
};

/**
 * Gets count of records in a table
 * @param model - Sequelize model
 * @returns Record count
 */
export const getTableCount = async (model: any): Promise<number> => {
  return model.count();
};

/**
 * Checks if database is empty
 * @param sequelize - Sequelize instance
 * @returns True if database is empty
 */
export const isDatabaseEmpty = async (sequelize: Sequelize): Promise<boolean> => {
  try {
    const { User } = await import('../../src/modules/auth/models/user.model');
    const userCount = await User.count();
    return userCount === 0;
  } catch (error) {
    return true;
  }
};
