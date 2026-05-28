const dotenv = require('dotenv');
const path = require('path');

const env = process.env.NODE_ENV || 'development';
dotenv.config({ path: path.resolve(process.cwd(), `.env.${env}`) });

// Prefer DATABASE_URL; fall back to individual DB_* vars
const url = process.env.DATABASE_URL?.split('?')[0] ?? (() => {
  const { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME } = process.env;
  if (DB_HOST && DB_NAME) {
    const auth = DB_USER ? `${DB_USER}${DB_PASSWORD ? `:${DB_PASSWORD}` : ''}@` : '';
    const port = DB_PORT ? `:${DB_PORT}` : '';
    return `postgres://${auth}${DB_HOST}${port}/${DB_NAME}`;
  }
  return undefined;
})();

const sslEnabled = process.env.DB_SSL === 'true';

const dialectOptions = sslEnabled
  ? {
      ssl: {
        require: true,
        rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true',
        minVersion: 'TLSv1.2',
        ...(process.env.DB_SSL_CA ? { ca: process.env.DB_SSL_CA } : {}),
      },
    }
  : {};

const pool = {
  production: { max: 50, min: 10 },
  development: { max: 5, min: 0 },
  test: { max: 2, min: 0 },
};

const baseConfig = {
  dialect: 'postgres',
  migrationStorageTableName: 'SequelizeMeta',
  seedersStorage: 'sequelize',
  seedersStorageTableName: 'seeders',
  dialectOptions,
};

module.exports = {
  development: { ...baseConfig, url, pool: pool.development },
  production:  { ...baseConfig, url, pool: pool.production, logging: false },
  test:        { ...baseConfig, url, pool: pool.test, logging: false },
};
