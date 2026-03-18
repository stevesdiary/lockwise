import 'dotenv/config';

import sequelize, { runMigrations } from '../shared/core/database';

const migrate = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    await runMigrations();
  } catch (error) {
    console.error('Migration failed:', error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
};

void migrate();
