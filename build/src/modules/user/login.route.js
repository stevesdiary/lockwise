"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const login_controller_1 = require("./login.controller");
const loginRouter = (0, express_1.Router)();
loginRouter.post("/login", (req, res) => {
    (0, login_controller_1.login)(req, res);
});
loginRouter.post("/logout", (req, res) => {
    (0, login_controller_1.logout)(req, res);
});
exports.default = loginRouter;
