require('dotenv').config();
const { Pool } = require('pg');
const url = process.env.DB_URL;

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  logging: true,
  ssl: {
    require: true,
    rejectUnauthorized: false,
  },
};

const db = new Pool(config)

async function connectDatabase() {
  try {
    const result = await db.query('SELECT NOW()');
    console.log('Connected to DB showing Current time:', result.rows[0].now);
  } catch (err) {
    console.error('Error executing query', err);
  }
}

connectDatabase();
module.exports = { connectDatabase };