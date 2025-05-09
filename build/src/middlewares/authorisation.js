"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRole = void 0;
const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            console.log("USER", req.user);
            res.status(401).json({
                status: 'error',
                message: 'Unauthorized - No user found in request'
            });
            return;
        }
        const userRole = req.user.role;
        if (!roles.includes(userRole)) {
            res.status(403).json({
                status: 'error',
                message: 'Access denied - insufficient permission'
            });
            return;
        }
        next();
    };
};
exports.checkRole = checkRole;
