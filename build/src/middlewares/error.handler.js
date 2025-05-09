"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleError = void 0;
const yup_1 = __importDefault(require("yup"));
const handleError = (error) => {
    if (error instanceof yup_1.default.ValidationError) {
        return {
            statusCode: 400,
            status: 'error',
            message: 'Validation failed',
            data: {
                errors: error.errors
            }
        };
    }
    return {
        statusCode: 500,
        status: 'error',
        message: 'Internal server error',
        data: {
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        }
    };
};
exports.handleError = handleError;
