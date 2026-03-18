const dotenv = require('dotenv');
dotenv.config();

const url = process.env.DATABASE_URL?.split('?')[0];

const dialectOptions = {
  ssl: {
    require: true,
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true',
    minVersion: 'TLSv1.2',
    ...(process.env.DB_SSL_CA ? { ca: process.env.DB_SSL_CA } : {}),
  },
};

const pool = {
  production: { max: 50, min: 10 },
  development: { max: 5, min: 0 },
  test: { max: 2, min: 0 },
};

const baseConfig = {
  dialect: 'postgres',
  migrationStorageTableName: 'migrations',
  seedersStorage: 'sequelize',
  seedersStorageTableName: 'seeders',
  dialectOptions,
};

module.exports = {
  development: { ...baseConfig, url, pool: pool.development },
  production:  { ...baseConfig, url, pool: pool.production, logging: false },
  test:        { ...baseConfig, url, pool: pool.test, logging: false },
};
