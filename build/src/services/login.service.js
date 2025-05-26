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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutUser = exports.loginUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("../modules/user/user.model");
const jwtExpiry = process.env.JWT_EXPIRY || "1h";
const jwtSecret = process.env.JWT_SECRET || "secret";
const loginUser = (email, password, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_model_1.User.findOne({
            where: {
                ['email']: email
            }
        });
        if (!user) {
            return {
                statusCode: 404,
                status: "fail",
                message: "User not found",
                data: [],
            };
        }
        const validPassword = yield bcrypt_1.default.compare(password, user.password);
        if (!validPassword) {
            return {
                statusCode: 400,
                status: "fail",
                message: "Invalid password",
                data: [],
            };
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, jwtSecret, { expiresIn: jwtExpiry });
        res.cookie("sessionId", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 3600000,
        });
        return {
            statusCode: 200,
            status: "success",
            message: "User logged in",
            data: { token },
        };
    }
    catch (error) {
        throw error;
    }
});
exports.loginUser = loginUser;
const logoutUser = (res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.clearCookie("sessionId", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
        });
        return {
            statusCode: 200,
            status: "success",
            message: "User logged out",
            data: [],
        };
    }
    catch (error) {
        throw error;
    }
});
exports.logoutUser = logoutUser;
