const dotenv = require('dotenv');

dotenv.config();

const baseConfig = {
  dialect: 'postgres',
  seedersStorage: 'sequelize',
  seedersStorageTableName: 'seeders',
  migrationStorageTableName: 'migrations',
};

module.exports = {
  development: {
    ...baseConfig,
    host: process.env.DEV_DB_HOST || 'localhost',
    username: process.env.DEV_DB_USER || 'postgres',
    password: process.env.DEV_DB_PASSWORD,
    database: process.env.DEV_DB_NAME,
    port: process.env.DEV_DB_PORT || 5432,
    dialectOptions: {
      ssl: {
        require: process.env.SSL,
        rejectUnauthorized: false
      }
    }
  },
  
  production: {
    ...baseConfig,
    host: process.env.PROD_DB_HOST,
    username: process.env.PROD_DB_USER,
    password: process.env.PROD_DB_PASSWORD,
    database: process.env.PROD_DB_NAME,
    port: process.env.PROD_DB_PORT || 5432,
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  },
  
  test: {
    ...baseConfig,
    host: process.env.TEST_DB_HOST || 'localhost',
    username: process.env.TEST_DB_USER || 'postgres',
    password: process.env.TEST_DB_PASSWORD,
    database: process.env.TEST_DB_NAME || 'lockwise_test',
    port: process.env.TEST_DB_PORT || 5432,
    logging: false
  }
}