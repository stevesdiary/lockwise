import dotenv from 'dotenv';
dotenv.config();
import { Sequelize } from 'sequelize-typescript';
import { User } from '../../modules/auth/models/user.model';
import { Payment } from '../../modules/payment/models/payment.model';
import { Estate } from '../../modules/estate/models/estate.model';
import { Role } from '../../modules/auth/models/role.model';
import { Street } from '../../modules/estate/models/street.model';
import { Permission } from '../../modules/auth/models/permission.model';
import { Unit } from '../../modules/estate/models/unit.model';
import { RolePermission } from '../../modules/auth/models/role.permission.model';
import { Resident } from '../../modules/estate/models/resident.model';
import { Plan } from '../../modules/payment/models/plan.model';
import { Referrer } from '../../modules/payment/models/referrer.model';
import { ReferralBonus } from '../../modules/payment/models/referral.bonus.model';
import { Subscription } from '../../modules/payment/models/subscription.model';
import { Address } from '../../modules/location/models/address.model';

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
  models: [User, Estate, Resident, Role, Payment, Street, Permission, Unit, RolePermission, Plan, Referrer, ReferralBonus, Address, Subscription],
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    },
    keepAlive: true,
    statement_timeout: 60000,
    query_timeout: 60000,
    connectionTimeoutMillis: 60000,
  },
  pool: {
    max: isProduction ? 50 : 20,
    min: isProduction ? 10 : 2,
    acquire: 120000,
    idle: 60000,
    evict: 1000,
  },
  benchmark: !isProduction,
  logging: isProduction ? false : (sql, timing) => {
    if (timing && timing > 1000) {
      console.warn(`Slow query (${timing}ms):`, sql);
    }
  },
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
  },
  retry: {
    max: 5,
    timeout: 10000,
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
