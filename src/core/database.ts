import dotenv from 'dotenv';
dotenv.config();
import { Sequelize } from 'sequelize-typescript';
import { User } from '../modules/user/user.model';
import { Payment } from '../modules/payment/payment.model';
import { Estate } from '../modules/estate/estate.model';
import { Role } from '../modules/role/role.model';
import { Street } from '../modules/estate/street.model';
import { Permission } from '../modules/permission/permission.model';
import { Unit } from '../modules/estate/unit.model';
import { AccessLog } from '../modules/accessLog/accessLog.model';
import { RolePermission } from '../modules/permission/role.permission.model';
import { Resident } from '../modules/resident/resident.model';

const sequelize = new Sequelize({
  dialect: 'postgres',
  dialectModule: require('pg'),
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'your_database',
  models: [User, Estate, Resident, Role, Payment, Street, Permission, Unit, AccessLog, RolePermission, Unit],
  ssl: true,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    },
    connectionTimeout: 30000
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

export default sequelize;
