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
  }
  
};

export default paymentController;
