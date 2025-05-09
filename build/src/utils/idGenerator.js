"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateEstateId = generateEstateId;
exports.generateResidentId = generateResidentId;
exports.generateId = generateId;
function generateEstateId() {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
}
function generateResidentId() {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
}
function generateId() {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
}
