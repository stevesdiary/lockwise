import { Request as ExpressRequest, Response } from 'express';
import * as yup from 'yup';

import { 
  paymentInitiationSchema, 
  paymentVerificationSchema 
} from '../utils/validator';
import { paymentService } from '../services/payment.service';

const paymentController = {
  initiatePayment: async (req: ExpressRequest, res: Response) => {
    try {
      const transactionData = await paymentInitiationSchema.validate(req.body, { 
        abortEarly: false 
      });
      // if (!req.user){
      //   return ('User not authenticated!')
      // }
      // console.log(req.user, transactionData)
      const paymentData = {
        amount: transactionData.amount,
        email: transactionData.email,
        currency: transactionData.currency || 'NGN',
        payment_provider: transactionData.paymentProvider || 'paystack',
        payment_method: transactionData.paymentMethod
      };
      const paymentResult = await paymentService.initiatePayment(paymentData);
      if (!paymentResult) {
        console.error('Failed to initiate');
        return res.status(500).json({
          status: 'error',
          message: 'Failed to initiate payment'
        });
      }
      return res.status(paymentResult.statusCode).json(paymentResult);
    } catch (error) {
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
  },

  verifyPayment: async (req: ExpressRequest, res: Response) => {
    try {
      const validatedData = await paymentVerificationSchema.validate(req.params, { 
        abortEarly: false 
      });
      
      const verificationResult = await paymentService.verifyPayment(validatedData);
      
      return res.status(verificationResult.statusCode).json(verificationResult);
    } catch (error) {
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
  },

  getAllPayments: async (req: ExpressRequest, res: Response) => {
    try {
      const { page = 1, limit = 50, status } = req.query;
      const offset = (Number(page) - 1) * Number(limit);
      
      const payments = await paymentService.getAllPayments({
        limit: Number(limit),
        offset,
        status: status as string
      });

      return res.status(payments.statusCode).json(payments);
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  getPaymentById: async (req: ExpressRequest, res: Response) => {
    try {
      const { paymentId } = req.params;
      const payment = await paymentService.getPaymentById(paymentId);
      return res.status(payment.statusCode).json(payment);
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  getPaymentByReference: async (req: ExpressRequest, res: Response) => {
    try {
      const { reference } = req.params;
      const payment = await paymentService.getPaymentByReference(reference);
      return res.status(payment.statusCode).json(payment);
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
};

export default paymentController;
