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
Object.defineProperty(exports, "__esModule", { value: true });
const yup = __importStar(require("yup"));
const validator_1 = require("../../utils/validator");
const payment_service_1 = require("./payment.service");
const paymentController = {
    initiatePayment: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const transactionData = yield validator_1.paymentInitiationSchema.validate(req.body, {
                abortEarly: false
            });
            const paymentData = {
                amount: transactionData.amount,
                email: transactionData.email,
                currency: transactionData.currency || 'NGN',
                payment_provider: transactionData.paymentProvider,
                payment_method: transactionData.paymentMethod,
            };
            const paymentResult = yield payment_service_1.paymentService.initiatePayment(paymentData);
            if (!paymentResult) {
                console.error('Failed to initiate');
                return res.status(500).json({
                    status: 'error',
                    message: 'Failed to initiate payment'
                });
            }
            return res.status(paymentResult.statusCode).json(paymentResult);
        }
        catch (error) {
            if (error instanceof yup.ValidationError) {
                const errors = error.inner.map(err => ({
                    field: err.path || 'unknown',
                    message: err.message,
                    type: err.type
                }));
                return res.status(400).json({
                    status: 'error',
                    message: 'Validation failed',
                    errors
                });
            }
            return res.status(500).json({
                status: 'error',
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }),
    verifyPayment: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validatedData = yield validator_1.paymentVerificationSchema.validate(req.params, {
                abortEarly: false
            });
            const verificationResult = yield payment_service_1.paymentService.verifyPayment(validatedData);
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
            return res.status(500).json({
                status: 'error',
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }),
    getAllPayments: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { page, limit } = req.query;
            const pageNumber = parseInt(page, 10) || 1;
            const limitNumber = parseInt(limit, 10) || 10;
            const payments = yield payment_service_1.paymentService.getAllPayments({ limitNumber, pageNumber });
            return res.status(payments.statusCode).json({
                status: payments.status,
                message: payments.message,
                data: payments.data
            });
        }
        catch (error) {
            console.log(error);
            return res.status(500).json({
                status: 'error',
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }),
    getPaymentById: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { paymentId } = req.params;
            if (!paymentId) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Missing paymentId parameter',
                    error: 'Invalid request'
                });
            }
            const payment = yield payment_service_1.paymentService.getPaymentById(paymentId);
            return res.status(payment.statusCode).json({
                status: payment.status,
                message: payment.message,
                data: payment.data
            });
        }
        catch (error) {
            console.log(error);
            const statusCode = error.statusCode || 500;
            return res.status(500).json({
                status: 'error',
                message: error.message || 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }),
    getPaymentByReference: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { reference } = req.params;
            if (!reference) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Missing reference parameter',
                    error: 'Invalid request'
                });
            }
            const payment = yield payment_service_1.paymentService.getPaymentByReference(reference);
            return res.status(payment.statusCode).json({
                status: payment.status,
                message: payment.message,
                data: payment.data
            });
        }
        catch (error) {
            console.log(error);
            const statusCode = error.statusCode || 500;
            return res.status(500).json({
                status: 'error',
                message: error.message || 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }),
};
exports.default = paymentController;
