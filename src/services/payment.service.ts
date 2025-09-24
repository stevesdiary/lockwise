import axios from 'axios';
import { 
  PaymentVerificationData, 
  PaymentResponse,
  PaymentRequestData
} from '../types/payment.types';
import { v4 as uuidv4 } from 'uuid';
import { Payment } from '../models/payment.model';
import { User } from '../models/user.model';
import { brevoEmailService } from './brevo.email.service';
import { subscriptionService } from './subscription.service';

export const paymentService = {
  initiatePayment: async (paymentData: PaymentRequestData): Promise<PaymentResponse> => {
    try {
      const { amount, email, currency, payment_provider, payment_method } = paymentData;
      
      if (!amount || !email || !payment_provider || !payment_method) {
        return {
          statusCode: 400,
          status: 'error',
          message: 'Missing required payment data',
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
      
      const user = await User.findOne({
        where: { email },
        attributes: ['id', 'estate_id', 'first_name', 'last_name', 'email']
      });
      
      if (!user) {
        return {
          statusCode: 404,
          status: 'error',
          message: 'User not found',
          data: null
        };
      }
      
      const generateReference = uuidv4();
      
      // Create payment record first
      await Payment.create({
        amount,
        email,
        reference: generateReference,
        payment_provider,
        currency: currency || 'NGN',
        user_id: user.id,
        payment_method,
        payment_status: 'pending',
        estate_id: user.estate_id
      });
      
      const params = {
        amount: amount * 100,
        email,
        currency: currency || 'NGN',
        reference: generateReference
      };
      
      const response = await axios.post('https://api.paystack.co/transaction/initialize', params, {
        headers: {
          'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status !== 200) {
        return {
          statusCode: 400,
          status: 'error',
          message: 'Payment initialization failed',
          data: null
        };
      }
      
      const paymentResponse = {
        authorization_url: (response.data as any).data.authorization_url,
        reference: generateReference
      };
      
      return {
        statusCode: 200,
        status: 'success',
        message: 'Payment initiated successfully',
        data: paymentResponse
      };
    } catch (error) {
      console.error('Payment initiation error:', error);
      return {
        statusCode: 500,
        status: 'error',
        message: 'Internal server error',
        data: null
      };
    }
  },
  
  verifyPayment: async (verificationData: PaymentVerificationData): Promise<PaymentResponse> => {
    try {
      const payment = await Payment.findOne({
        where: { reference: verificationData.reference }
      });
      
      if (!payment) {
        return {
          statusCode: 404,
          status: 'error',
          message: 'Payment not found',
          data: null
        };
      }
      
      const response = await axios.get(`https://api.paystack.co/transaction/verify/${verificationData.reference}`, {
        headers: {
          'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status !== 200) {
        return {
          statusCode: 400,
          status: 'error',
          message: 'Payment verification failed',
          data: null
        };
      }
      
      const responseData = response.data as any;
      const isSuccess = responseData.data.status === 'success';
      
      await Payment.update(
        { 
          payment_status: isSuccess ? 'completed' : 'failed',
          payment_data: responseData
        },
        { where: { reference: verificationData.reference }}
      );
      
      // Send confirmation email and create subscription on success
      if (isSuccess) {
        await brevoEmailService.sendPaymentConfirmation(
          payment.email,
          responseData.data.amount / 100,
          verificationData.reference
        );
        
        // Create 30-day subscription
        if (payment.estate_id) {
          await subscriptionService.createSubscription({
            user_id: payment.user_id,
            plan_id: 'basic', // Default plan
            estate_id: payment.estate_id,
            duration_months: 1
          });
        }
      }
      
      return {
        statusCode: 200,
        status: 'success',
        message: 'Payment verified successfully',
        data: responseData
      };
    } catch (error) {
      console.error('Payment verification error:', error);
      return {
        statusCode: 500,
        status: 'error',
        message: 'Internal server error',
        data: null
      };
    }
  },

  getAllPayments: async (filters: { limit?: number; offset?: number; status?: string }) => {
    try {
      const payments = await Payment.findAll({
        where: {
          ...(filters.status && { payment_status: filters.status })
        },
        include: [
          { model: User, attributes: ['first_name', 'last_name', 'email'] }
        ],
        limit: filters.limit || 50,
        offset: filters.offset || 0,
        order: [['createdAt', 'DESC']]
      });

      return {
        statusCode: 200,
        status: 'success',
        message: 'Payments retrieved successfully',
        data: payments
      };
    } catch (error) {
      return {
        statusCode: 500,
        status: 'error',
        message: 'Failed to retrieve payments',
        data: null
      };
    }
  },

  getPaymentById: async (id: string) => {
    try {
      const payment = await Payment.findByPk(id, {
        include: [
          { model: User, attributes: ['first_name', 'last_name', 'email'] }
        ]
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
    } catch (error) {
      return {
        statusCode: 500,
        status: 'error',
        message: 'Failed to retrieve payment',
        data: null
      };
    }
  },

  getPaymentByReference: async (reference: string) => {
    try {
      const payment = await Payment.findOne({
        where: { reference },
        include: [
          { model: User, attributes: ['first_name', 'last_name', 'email'] }
        ]
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
    } catch (error) {
      return {
        statusCode: 500,
        status: 'error',
        message: 'Failed to retrieve payment',
        data: null
      };
    }
  }
};
