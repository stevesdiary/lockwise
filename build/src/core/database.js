"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const sequelize_typescript_1 = require("sequelize-typescript");
const user_model_1 = require("../modules/user/user.model");
const payment_model_1 = require("../modules/payment/payment.model");
const estate_model_1 = require("../modules/estate/estate.model");
const role_model_1 = require("../modules/role/role.model");
const sequelize = new sequelize_typescript_1.Sequelize({
    dialect: 'postgres',
    dialectModule: require('pg'),
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'your_database',
    models: [user_model_1.User, estate_model_1.Estate, role_model_1.Role, payment_model_1.Payment],
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
exports.default = sequelize;
