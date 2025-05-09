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
exports.paymentService = void 0;
const axios_1 = __importDefault(require("axios"));
const redis_1 = require("../../core/redis");
const uuid_1 = require("uuid");
const payment_model_1 = require("./payment.model");
const patient_model_1 = require("../patient/patient.model");
const appointment_model_1 = require("../appointment/appointment.model");
const user_model_1 = require("../user/user.model");
exports.paymentService = {
    initiatePayment: (paymentData) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { amount, email, currency, payment_provider, payment_method } = paymentData;
            if (!paymentData || !paymentData.amount || !paymentData.email || !paymentData.currency || !paymentData.payment_provider || !paymentData.payment_method) {
                return {
                    statusCode: 400,
                    status: 'error',
                    message: 'Invalid payment data',
                    data: null
                };
            }
            if (amount < 100) {
                return {
                    statusCode: 400,
                    status: 'error',
                    message: 'Amount must be greater than 100',
                    data: null
                };
            }
            const user = yield user_model_1.User.findOne({
                where: {
                    email: email
                },
                attributes: {
                    include: ['id']
                },
                include: [
                    {
                        model: patient_model_1.Patient,
                        as: "patient",
                        attributes: {
                            exclude: ["created_at", "updated_at", "deleted_at"]
                        }
                    }
                ]
            });
            if (!user) {
                return {
                    statusCode: 404,
                    status: 'error',
                    message: 'Patient not found',
                    data: null
                };
            }
            const appointment = yield appointment_model_1.Appointment.findOne({
                where: {
                    patient_id: user === null || user === void 0 ? void 0 : user.dataValues.patient.id,
                    status: 'pending'
                },
                order: [['createdAt', 'DESC']]
            });
            if (!appointment) {
                return {
                    statusCode: 404,
                    status: 'error',
                    message: 'No pending appointment found',
                    data: null
                };
            }
            const paymentInitData = {
                amount: amount,
                email: email,
                currency: currency,
                paymentProvider: payment_provider || 'paystack',
                paymentMethod: payment_method,
                patient_id: user === null || user === void 0 ? void 0 : user.dataValues.patient.id,
                appointment_id: appointment.id
            };
            const cacheKey = `payment:initiate:${paymentInitData.email}`;
            const generateReference = (0, uuid_1.v4)();
            const paystackCallback_url = `${process.env.PAYSTACK_CALLBACK_URL}`;
            const koraPayCallback_url = `${process.env.KORAPAY_CALLBACK_URL}`;
            const params = {
                amount: amount * 100,
                email: email,
                currency: currency || 'NGN',
                reference: generateReference,
            };
            if (payment_provider === 'korapay') {
                const apiSecret = 'process.env.KORA_SECRET_KEY';
                const config = {
                    headers: {
                        'Authorization': `Bearer ${process.env.KORA_PUBLIC_KEY}`,
                        'Content-Type': 'application/json',
                    },
                };
                const requestBody = {
                    amount: paymentData.amount,
                    currency: paymentData.currency || 'NGN',
                    payment_method: paymentData.payment_method,
                    email: paymentData.email,
                    metadata: {
                        custom_data: user.first_name,
                    },
                };
                axios_1.default.post('https://api.korapay.com/checkout/v1/sessions', requestBody, config)
                    .then((response) => {
                    const checkoutSessionId = response.data.id;
                    const checkoutUrl = `https://checkout.korapay.com/${checkoutSessionId}`;
                    console.log(`Redirect to: ${checkoutUrl}`);
                })
                    .catch((error) => {
                    console.error(error);
                });
            }
            const config = { headers: {
                    'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                } };
            const response = yield axios_1.default.post(paystackCallback_url, params, config);
            if (!response || response.status !== 200) {
                return {
                    statusCode: 400,
                    status: 'failure',
                    message: 'Payment not initiated',
                    data: null
                };
            }
            const paymentResponse = {
                data: {
                    authorization_url: response.data.data.authorization_url,
                    access_code: response.data.data.access_code,
                    reference: response.data.data.reference
                }
            };
            const createPayment = yield payment_model_1.Payment.create({
                amount: paymentData.amount,
                email: paymentData.email,
                reference: response.data.data.reference,
                payment_provider: 'paystack',
                currency: paymentData.currency || 'NGN',
                patient_id: user === null || user === void 0 ? void 0 : user.dataValues.patient.id,
                payment_method: paymentData.payment_method,
                payment_date: new Date(),
                payment_status: 'pending',
                appointment_id: appointment.id
            });
            if (createPayment) {
                console.log('Payment created successfully');
            }
            yield (0, redis_1.saveToRedis)(cacheKey, JSON.stringify(paymentResponse), 1800);
            return {
                statusCode: 200,
                status: 'success',
                message: 'Payment initiated successfully',
                data: {
                    authorization_url: response.data.data.authorization_url,
                    reference: response.data.data.reference
                }
            };
        }
        catch (error) {
            console.error('Payment initiation error:', error);
            throw error;
        }
    }),
    verifyPayment: (verificationData) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const cacheKey = `payment:verify:${verificationData.reference}`;
            const response = yield axios_1.default.get(`https://api.paystack.co/transaction/verify/${verificationData.reference}`, {
                headers: {
                    'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                    "Content-Type": "application/json"
                }
            });
            if (response.status !== 200) {
                return {
                    statusCode: 400,
                    status: 'failure',
                    message: 'Payment verification failed',
                    data: null
                };
            }
            const verificationResponse = {
                statusCode: 200,
                status: 'success',
                message: 'Payment verified successfully',
                data: response.data
            };
            yield (0, redis_1.saveToRedis)(cacheKey, JSON.stringify(verificationResponse), 3600);
            yield payment_model_1.Payment.update({
                payment_status: 'completed',
                payment_data: response.data
            }, { where: {
                    reference: verificationData.reference
                } });
            return verificationResponse;
        }
        catch (error) {
            console.error('Payment verification error:', error);
            return {
                statusCode: 500,
                status: 'error',
                message: 'Failed to verify payment',
                data: null
            };
        }
    }),
    getAllPayments: (fetchPayments) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            let { pageNumber, limitNumber } = fetchPayments;
            if (typeof pageNumber !== 'number' || pageNumber < 1)
                pageNumber = 1;
            if (typeof limitNumber !== 'number' || limitNumber < 1)
                limitNumber = 10;
            const offset = (pageNumber - 1) * limitNumber;
            const payments = yield payment_model_1.Payment.findAll({
                where: { deleted_at: null },
                offset,
                limit: limitNumber,
                order: [['createdAt', 'DESC']]
            });
            if (!payments || payments.length === 0) {
                return {
                    statusCode: 404,
                    status: 'error',
                    message: 'No payments found',
                    data: null
                };
            }
            return {
                statusCode: 200,
                status: 'success',
                message: 'Payments retrieved successfully',
                data: payments
            };
        }
        catch (error) {
            console.error('Error retrieving payments:', error);
            throw error;
        }
    }),
    getPaymentById: (paymentId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const payment = yield payment_model_1.Payment.findByPk(paymentId);
            if (!payment) {
                return {
                    statusCode: 404,
                    status: 'error',
                    message: 'Payment not found',
                    data: null
                };
            }
            return {
                statusCode: 200,
                status: 'success',
                message: 'Payment retrieved successfully',
                data: payment
            };
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }),
    getPaymentByReference: (reference) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const payment = yield payment_model_1.Payment.findOne({
                where: {
                    reference: reference
                }
            });
            if (!payment) {
                return {
                    statusCode: 404,
                    status: 'error',
                    message: 'Payment not found',
                    data: null
                };
            }
            return {
                statusCode: 200,
                status: 'success',
                message: 'Payment retrieved successfully',
                data: payment
            };
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    })
};
