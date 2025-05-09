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
exports.sendEmail = sendEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
function sendEmail(emailPayload) {
    return __awaiter(this, void 0, void 0, function* () {
        const transporter = nodemailer_1.default.createTransport({
            host: process.env.SMTP_SERVER,
            port: 587,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_KEY,
            },
        });
        const mailOptions = {
            from: process.env.SMTP_SENDER,
            to: emailPayload.to,
            subject: emailPayload.subject,
            text: emailPayload.text,
        };
        try {
            const info = yield transporter.sendMail(mailOptions);
            console.log('Message sent: ', info.response);
            if (!info) {
                console.error('Email not sent:', info);
                return {
                    statusCode: 400,
                    status: 'fail',
                    message: 'Email not sent',
                    data: info || null
                };
            }
            return {
                statusCode: 200,
                status: 'success',
                message: 'Email sent',
                data: info
            };
        }
        catch (error) {
            return {
                statusCode: 500,
                status: 'error',
                message: 'Error sending email',
                data: error
            };
        }
    });
}
exports.default = sendEmail;
