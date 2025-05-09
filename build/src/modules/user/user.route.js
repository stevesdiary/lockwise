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
const express_1 = require("express");
const user_controller_1 = __importDefault(require("./user.controller"));
const authorisation_1 = require("../../middlewares/authorisation");
const authentication_1 = __importDefault(require("../../middlewares/authentication"));
const userRouter = (0, express_1.Router)();
userRouter.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield user_controller_1.default.register(req, res);
}));
userRouter.post("/verify", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield user_controller_1.default.verifyUser(req, res);
}));
userRouter.post("/resendcode", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield user_controller_1.default.resendCode(req, res);
}));
userRouter.get('/all', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield user_controller_1.default.getAllUsers(req, res);
}));
userRouter.get('/one/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield user_controller_1.default.getOneUser(req, res);
}));
userRouter.delete('/delete/:id', authentication_1.default, (0, authorisation_1.checkRole)(['admin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield user_controller_1.default.deleteUser(req, res);
}));
exports.default = userRouter;
