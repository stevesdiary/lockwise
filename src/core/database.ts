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
import { Access, AccessEntry } from '../models/access.model';
import { RolePermission } from '../models/role.permission.model';
import { Resident } from '../models/resident.model';
import { Plan } from '../models/plan.model';
import { Referrer } from '../models/referrer.model';
import { ReferralBonus } from '../models/referral.bonus.model';
import { Subscription } from '../models/subscription.model';

const sequelize = new Sequelize({
  dialect: 'postgres',
  dialectModule: require('pg'),
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  models: [User, Estate, Resident, Role, Payment, Street, Permission, Unit, Access, AccessEntry, RolePermission, Plan, Referrer, ReferralBonus, Subscription],
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  logging: console.log
});

export default sequelize;
