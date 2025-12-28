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
    keepAlive: true
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  logging: isProduction ? false : console.log
});

export default sequelize;
