const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

const databaseConnection = {
  dialect: 'postgres',
  seedersStorage: 'sequelize',
  seedersStorageTableName: 'seeders',
  migrationStorageTableName: 'migrations',
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: true
    }
  }
}

module.exports = {
  test: databaseConnection,
  development: databaseConnection,
  production: databaseConnection
}