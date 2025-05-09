"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.login = void 0;
const login_service_1 = require("../services/login.service");
const validator_1 = require("../../utils/validator");
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validateLogin = yield validator_1.loginSchema.validate(req.body, { abortEarly: false });
        const { email, password } = validateLogin;
        const user = yield (0, login_service_1.loginUser)(email, password, res);
        return res.status(user.statusCode).send({
            status: (user.status),
            message: (user.message),
            data: (user.data)
        });
    }
    catch (error) {
        console.error('Login error:', error);
        if (error instanceof Error) {
            if (error.name === 'ValidationError') {
                console.log('VALIDATION ERROR:', error, error.message);
                return res.status(400).json({
                    status: 'error',
                    message: error.message
                });
            }
            return res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
        return res.status(500).json({
            status: 'error',
            message: 'An unexpected error occurred'
        });
    }
});
exports.login = login;
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield (0, login_service_1.logoutUser)(res);
        return res.status(user.statusCode).send({
            status: (user.status),
            message: (user.message),
            data: (user.data)
        });
    }
    catch (error) {
        return res.status(500).send({
            error: error
        });
    }
});
exports.logout = logout;
