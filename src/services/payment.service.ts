import { Payment } from '../models/payment.model';
import { ApiResponse } from '../types/user.type';

interface PaymentInitiationData {
  amount: number;
  email: string;
  currency: string;
  payment_provider?: string;
  payment_method: string;
  user_id?: string;
  estate_id?: string;
}

interface PaymentVerificationData {
  reference: string;
}

interface PaginationOptions {
  limitNumber: number;
  pageNumber: number;
}

class PaymentService {
  async initiatePayment(paymentData: PaymentInitiationData): Promise<ApiResponse<any>> {
    try {
      // Generate a unique reference for the payment
      const reference = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create payment record in database
      const payment = await Payment.create({
        amount: paymentData.amount,
        currency: paymentData.currency,
        payment_provider: paymentData.payment_provider || 'paystack',
        payment_method: paymentData.payment_method,
        reference: reference,
        payment_status: 'pending',
        user_id: paymentData.user_id,
        estate_id: paymentData.user_id // You may need to get this from user or pass separately
      });

      // Here you would integrate with actual payment provider (Paystack, Flutterwave, etc.)
      // For now, returning a mock response
      return {
        statusCode: 200,
        status: 'success',
        message: 'Payment initiated successfully',
        data: {
          reference: reference,
          authorization_url: `https://checkout.paystack.com/${reference}`,
          access_code: `access_${reference}`,
          payment_id: payment.id
        }
      };
    } catch (error) {
      console.error('Payment initiation error:', error);
      return {
        statusCode: 500,
        status: 'fail',
        message: 'Failed to initiate payment',
        data: null
      };
    }
  }

  async verifyPayment(verificationData: PaymentVerificationData): Promise<ApiResponse<any>> {
    try {
      // Find payment by reference
      const payment = await Payment.findOne({
        where: { reference: verificationData.reference }
      });

      if (!payment) {
        return {
          statusCode: 404,
          status: 'fail',
          message: 'Payment not found',
          data: null
        };
      }

      // Here you would verify with actual payment provider
      // For now, marking as successful
      payment.payment_status = 'completed';
      await payment.save();

      return {
        statusCode: 200,
        status: 'success',
        message: 'Payment verified successfully',
        data: {
          reference: payment.reference,
          amount: payment.amount,
          status: payment.payment_status,
          payment_date: payment.payment_date
        }
      };
    } catch (error) {
      console.error('Payment verification error:', error);
      return {
        statusCode: 500,
        status: 'fail',
        message: 'Failed to verify payment',
        data: null
      };
    }
  }

  async getAllPayments(options: PaginationOptions): Promise<ApiResponse<any[]>> {
    try {
      const { limitNumber, pageNumber } = options;
      const offset = (pageNumber - 1) * limitNumber;

      const { count, rows: payments } = await Payment.findAndCountAll({
        limit: limitNumber,
        offset: offset,
        order: [['created_at', 'DESC']]
      });

      return {
        statusCode: 200,
        status: 'success',
        message: 'Payments retrieved successfully',
        data: [
          ...payments.map(payment => payment.toJSON()),
          {
            pagination: {
              total: count,
              page: pageNumber,
              limit: limitNumber,
              totalPages: Math.ceil(count / limitNumber)
            }
          }
        ]
      };
    } catch (error) {
      console.error('Get all payments error:', error);
      return {
        statusCode: 500,
        status: 'fail',
        message: 'Failed to retrieve payments',
        data: []
      };
    }
  }

  async getPaymentById(paymentId: string): Promise<ApiResponse<any>> {
    try {
      const payment = await Payment.findByPk(paymentId);

      if (!payment) {
        return {
          statusCode: 404,
          status: 'fail',
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
      console.error('Get payment by ID error:', error);
      return {
        statusCode: 500,
        status: 'fail',
        message: 'Failed to retrieve payment',
        data: null
      };
    }
  }

  async getPaymentByReference(reference: string): Promise<ApiResponse<any>> {
    try {
      const payment = await Payment.findOne({
        where: { reference }
      });

      if (!payment) {
        return {
          statusCode: 404,
          status: 'fail',
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
      console.error('Get payment by reference error:', error);
      return {
        statusCode: 500,
        status: 'fail',
        message: 'Failed to retrieve payment',
        data: null
      };
    }
  }
}

export const paymentService = new PaymentService();
export default paymentService;