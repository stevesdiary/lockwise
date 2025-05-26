"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const yup = __importStar(require("yup"));
const validation_schema_1 = require("../../schemas/validation.schema");
const error_handler_1 = require("../../middlewares/error.handler");
const user_repository_1 = require("../repositories/user.repository");
const UserController = {
    register: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validatedData = yield validation_schema_1.userRegistrationSchema.validate(req.body, {
                abortEarly: false
            });
            const estate_id = yield validation_schema_1.idSchema.validate(req.query.estate_id, { abortEarly: false });
            const { confirm_password } = validatedData, userData = __rest(validatedData, ["confirm_password"]);
            const userCreationData = Object.assign(Object.assign({}, userData), { verified: false, estate_id: estate_id, role: "resident", _creationAttributes: {}, id: undefined });
            const user = yield new user_repository_1.UserRepository().create(userCreationData);
            return res.status(user.statusCode).send({
                status: user.status,
                message: user.message,
                data: user.data
            });
        }
        catch (error) {
            if (error instanceof yup.ValidationError) {
                console.log('ERROR DUE TO VALIDATION', error);
                const errors = error.inner.map(err => ({
                    field: err.path || 'unknown',
                    message: err.message
                }));
                return res.status(400).json({
                    status: 'error',
                    message: 'Validation failed',
                    errors
                });
            }
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return res.status(500).json({
                status: 'error',
                message: 'Internal server error',
                error: errorMessage
            });
        }
    }),
    verifyUser: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validatedData = yield validation_schema_1.userVerificationSchema.validate(req.body, { abortEarly: false });
            const { email, code } = validatedData;
            const verificationResult = yield verifyUser({ email, code });
            return res.status(verificationResult.statusCode).json(verificationResult);
        }
        catch (error) {
            if (error instanceof yup.ValidationError) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Validation failed',
                    errors: error.errors.map(errorMsg => ({
                        message: errorMsg
                    }))
                });
            }
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return res.status(500).json({
                status: 'error',
                message: 'Internal server error',
                error: errorMessage
            });
        }
    }),
    resendCode: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const emailPayload = yield validation_schema_1.emailSchema.validate(req.body, { abortEarly: false });
            const resend = yield resendCode(emailPayload.email);
            return res.status(resend.statusCode).send({
                status: 'success',
                message: 'Verification code resent',
                data: resend.data
            });
        }
        catch (error) {
            if (error instanceof yup.ValidationError) {
                return res.status(400).send({
                    status: 'error',
                    errors: error.errors
                });
            }
            return res.status(500).send({
                status: 'error',
                message: 'Internal server error',
                details: error instanceof Error ? error.message : error
            });
        }
    }),
    getAllUsers: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const users = yield getAllUsers();
            return res.status(users.statusCode).send({
                status: users.status,
                message: users.message,
                data: users.data
            });
        }
        catch (error) {
            const errorResponse = (0, error_handler_1.handleError)(error);
            return res.status(errorResponse.statusCode).json(errorResponse.message);
        }
        ;
    }),
    getOneUser: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const user = yield getOneUser(req.params.id);
            return res.status(user.statusCode).send({
                status: (user.status),
                message: (user.message),
                data: (user.data)
            });
        }
        catch (error) {
            console.log(error);
            return res.status(500).send({
                error: error
            });
        }
    }),
    updateUser: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const id = req.params.id;
            const validatedData = yield validation_schema_1.userUpdateSchema.validate(req.body, req.params);
            const update = yield updateUser(id, validatedData);
            return res.status(update.statusCode).send({ status: (update.status), message: (update.message), data: (update.data) });
        }
        catch (error) {
            return res.status(500).send({
                error: error
            });
        }
    }),
    deleteUser: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const payload = yield validation_schema_1.idSchema.validate(req.params.id);
            const deleteUserById = yield deleteUser(payload);
            return res.status(deleteUserById.statusCode).send({
                status: deleteUserById.status,
                message: deleteUserById.message,
                data: deleteUserById.data
            });
        }
        catch (error) {
            return res.status(500).send({
                error: error
            });
        }
    })
};
exports.default = UserController;
