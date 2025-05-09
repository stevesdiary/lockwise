"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const secret = process.env.JWT_SECRET || 'secret';
const authentication = (req, res, next) => {
    var _a;
    if (!secret) {
        throw new Error('JWT_SECRET must be defined in environment variables');
    }
    let token;
    token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
    if (!token) {
        res.status(401).json({ message: 'No token provided' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        if (!decoded) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        req.user = decoded;
        next();
    }
    catch (error) {
        console.error('AUTHENTICATION ERROR:', error);
        res.status(401).send({ error: 'Please authenticate.' });
    }
};
exports.default = authentication;
