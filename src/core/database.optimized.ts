import dotenv from 'dotenv';
dotenv.config();
import { Sequelize } from 'sequelize-typescript';
import { User } from '../models/user.model';
import { Payment } from '../models/payment.model';
import { Estate } from '../models/estate.model';
import { Role } from '../models/role.model';
import { Street } from '../models/street.model';
import { Permission } from '../models/permission.model';
import { Unit } from '../models/unit.model';
import { AccessLog } from '../models/access.log.model';
import { RolePermission } from '../models/role.permission.model';
import { Resident } from '../models/resident.model';
import { Plan } from '../models/plan.model';
import { Referrer } from '../models/referrer.model';
import { ReferralBonus } from '../models/referral.bonus.model';
import { Subscription } from '../models/subscription.model';
import { Address } from '../models/address.model';

const env = process.env.NODE_ENV || 'development';
const isProduction = env === 'production';

const sequelize = new Sequelize({
  dialect: 'postgres',
  dialectModule: require('pg'),
  host: isProduction ? (process.env.PROD_DB_HOST || 'localhost') : (process.env.DEV_DB_HOST || 'localhost'),
  port: parseInt(isProduction ? (process.env.PROD_DB_PORT || '5432') : (process.env.DEV_DB_PORT || '5432')),
  username: isProduction ? (process.env.PROD_DB_USER || 'postgres') : (process.env.DEV_DB_USER || 'postgres'),
  password: isProduction ? (process.env.PROD_DB_PASSWORD || '') : (process.env.DEV_DB_PASSWORD || ''),
  database: isProduction ? (process.env.PROD_DB_NAME || 'lockwise') : (process.env.DEV_DB_NAME || 'lockwise_dev'),
  models: [User, Estate, Resident, Role, Payment, Street, Permission, Unit, AccessLog, RolePermission, Plan, Referrer, ReferralBonus, Address, Subscription],
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    },
    keepAlive: true,
    statement_timeout: 30000,
    query_timeout: 30000,
    connectionTimeoutMillis: 30000,
  },
  // OPTIMIZED POOL CONFIGURATION
  pool: {
    max: isProduction ? 50 : 20,  // Increased from 5
    min: isProduction ? 10 : 2,   // Increased from 0
    acquire: 60000,               // Increased timeout
    idle: 30000,                  // Increased idle time
    evict: 1000,                  // Connection eviction interval
  },
  // QUERY OPTIMIZATION
  benchmark: !isProduction,
  logging: isProduction ? false : (sql, timing) => {
    if (timing && timing > 1000) {
      console.warn(`Slow query (${timing}ms):`, sql);
    }
  },
  // PERFORMANCE SETTINGS
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
  },
  // RETRY CONFIGURATION
  retry: {
    max: 3,
    timeout: 5000,
    match: [
      /ETIMEDOUT/,
      /EHOSTUNREACH/,
      /ECONNRESET/,
      /ECONNREFUSED/,
      /ENOTFOUND/,
      /SequelizeConnectionError/,
      /SequelizeConnectionRefusedError/,
      /SequelizeHostNotFoundError/,
      /SequelizeHostNotReachableError/,
      /SequelizeInvalidConnectionError/,
      /SequelizeConnectionTimedOutError/,
    ]
  }
});

export default sequelize;