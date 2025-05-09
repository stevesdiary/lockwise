"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_route_1 = __importDefault(require("./modules/user/user.route"));
const login_route_1 = __importDefault(require("./modules/user/login.route"));
const payment_route_1 = __importDefault(require("./modules/payment/payment.route"));
const estate_route_1 = __importDefault(require("./modules/estate/estate.route"));
const role_route_1 = __importDefault(require("./modules/role/role.route"));
const router = (0, express_1.Router)();
router.use("/user", user_route_1.default);
router.use("/log", login_route_1.default);
router.use('/payment', payment_route_1.default);
router.use('/estate', estate_route_1.default);
router.use('/role', role_route_1.default);
exports.default = router;
