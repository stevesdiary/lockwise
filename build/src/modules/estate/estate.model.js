"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Estate = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const resident_model_1 = require("../resident/resident.model");
let Estate = class Estate extends sequelize_typescript_1.Model {
};
exports.Estate = Estate;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        primaryKey: true,
        defaultValue: sequelize_typescript_1.DataType.UUIDV4,
    }),
    __metadata("design:type", String)
], Estate.prototype, "estate_id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
    }),
    __metadata("design:type", String)
], Estate.prototype, "name", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false
    }),
    __metadata("design:type", String)
], Estate.prototype, "invitation_code", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
    }),
    __metadata("design:type", String)
], Estate.prototype, "address", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM('residential', 'mixed', 'other', 'commercial'),
        allowNull: false,
    }),
    __metadata("design:type", String)
], Estate.prototype, "type", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
    }),
    __metadata("design:type", String)
], Estate.prototype, "city", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
    }),
    __metadata("design:type", String)
], Estate.prototype, "state", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false
    }),
    __metadata("design:type", String)
], Estate.prototype, "country", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.NUMBER,
        allowNull: false,
    }),
    __metadata("design:type", Number)
], Estate.prototype, "total_number_of_apartments", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.NUMBER
    }),
    __metadata("design:type", Number)
], Estate.prototype, "total_floors", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.NUMBER
    }),
    __metadata("design:type", Number)
], Estate.prototype, "total_parking_spaces", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.NUMBER
    }),
    __metadata("design:type", Number)
], Estate.prototype, "total_number_of_staff", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM('active', 'inactive', 'under_maintenance', 'suspended', 'pending'),
    }),
    __metadata("design:type", String)
], Estate.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
    }),
    __metadata("design:type", String)
], Estate.prototype, "contact", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM('approved', 'pending', 'declined'),
        allowNull: false,
        defaultValue: 'pending'
    }),
    __metadata("design:type", String)
], Estate.prototype, "estate_approval_status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE
    }),
    __metadata("design:type", Date)
], Estate.prototype, "estate_approved_on", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => resident_model_1.Resident, {
        foreignKey: 'estate_id',
    }),
    __metadata("design:type", Array)
], Estate.prototype, "residents", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING
    }),
    __metadata("design:type", String)
], Estate.prototype, "zip_code", void 0);
exports.Estate = Estate = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'estates',
        indexes: [
            {
                name: 'estate_id_index',
                fields: ['estate_id', 'invitation_code'],
                using: 'BTREE',
                unique: true,
            },
        ],
        timestamps: true,
        underscored: true,
        freezeTableName: true,
        paranoid: true,
    })
], Estate);
