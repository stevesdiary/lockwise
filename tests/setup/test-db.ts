import { Sequelize } from 'sequelize-typescript';
import path from 'path';

/**
 * Creates an in-memory SQLite database for testing
 * @returns Promise<Sequelize> - Configured Sequelize instance
 */
export const createTestDatabase = async (): Promise<Sequelize> => {
  const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
    models: [path.join(__dirname, '../../src/models')],
  });

  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
    console.log('✓ Test database created successfully');
    return sequelize;
  } catch (error) {
    console.error('Failed to create test database:', error);
    throw error;
  }
};

/**
 * Cleans all data from the database while preserving schema
 * @param sequelize - Sequelize instance
 */
export const cleanDatabase = async (sequelize: Sequelize): Promise<void> => {
  try {
    await sequelize.truncate({ cascade: true, force: true });
  } catch (error) {
    console.error('Failed to clean database:', error);
    throw error;
  }
};

/**
 * Closes the database connection
 * @param sequelize - Sequelize instance
 */
export const closeDatabase = async (sequelize: Sequelize): Promise<void> => {
  try {
    await sequelize.close();
  } catch (error) {
    console.error('Failed to close database:', error);
    throw error;
  }
};
