import { validateEndpointOwnership } from '../utils/endpointGenerator';
import { transactionService } from './transactionService';
import { PaystackService } from './paystackService';

// Import PrismaClient dynamically
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

export interface PaymentRequest {
  amount: number;
  currency?: string;
  description?: string;
  customerEmail?: string;
  metadata?: Record<string, any>;
  redirectUrl?: string;
  webhookUrl?: string;
}

export interface PaymentResponse {
  success: boolean;
  data?: any;
  error?: {
    code: string;
    message: string;
  };
}

export class PaymentService {
  /**
   * Process payment via unique endpoint
   */
  async processPayment(endpoint: string, paymentData: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Validate endpoint ownership
      const validation = await validateEndpointOwnership(endpoint);
      
      if (!validation.isValid) {
        return {
          success: false,
          error: {
            code: 'INVALID_ENDPOINT',
            message: 'Payment endpoint is invalid or does not exist'
          }
        };
      }

      if (!validation.userId) {
        return {
          success: false,
          error: {
            code: 'INVALID_USER',
            message: 'Unable to identify user for this endpoint'
          }
        };
      }

      // Validate payment data
      const validationError = this.validatePaymentData(paymentData);
      if (validationError) {
        return {
          success: false,
          error: validationError
        };
      }

      // Create transaction
      const transactionResult = await transactionService.initializeTransaction(
        validation.userId,
        paymentData.amount,
        paymentData.currency || 'NGN',
        'CREDIT',
        {
          description: paymentData.description || `Payment via ${endpoint}`,
          metadata: {
            ...paymentData.metadata,
            paymentEndpoint: endpoint,
            customerEmail: paymentData.customerEmail,
            source: 'PAYMENT_ENDPOINT'
          }
        }
      );

      if (!transactionResult.success) {
        return {
          success: false,
          error: {
            code: 'TRANSACTION_FAILED',
            message: transactionResult.error?.message || 'Failed to initialize transaction'
          }
        };
      }

      // Process the transaction immediately
      const processResult = await transactionService.processTransaction(
        transactionResult.data!.reference,
        {
          providerRef: `PAY_${endpoint}_${Date.now()}`,
          metadata: {
            paymentEndpoint: endpoint,
            processedAt: new Date().toISOString()
          }
        }
      );

      if (!processResult.success) {
        return {
          success: false,
          error: {
            code: 'PAYMENT_FAILED',
            message: processResult.error?.message || 'Failed to process payment'
          }
        };
      }

      return {
        success: true,
        data: {
          reference: transactionResult.data!.reference,
          amount: paymentData.amount,
          currency: paymentData.currency || 'NGN',
          status: 'SUCCESS',
          redirectUrl: paymentData.redirectUrl || `https://your-site.com/payment/success?ref=${transactionResult.data!.reference}`,
          createdAt: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('Payment processing error:', error);
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Payment processing failed: ' + (error instanceof Error ? error.message : String(error))
        }
      };
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(reference: string): Promise<PaymentResponse> {
    try {
      const transaction = await prisma.transaction.findUnique({
        where: { reference },
        include: {
          user: {
            select: { name: true, email: true }
          }
        }
      });

      if (!transaction) {
        return {
          success: false,
          error: {
            code: 'TRANSACTION_NOT_FOUND',
            message: 'Transaction not found'
          }
        };
      }

      return {
        success: true,
        data: {
          reference: transaction.reference,
          amount: Number(transaction.amount),
          currency: transaction.currency,
          status: transaction.status,
          createdAt: transaction.createdAt.toISOString()
        }
      };

    } catch (error) {
      console.error('Payment status check error:', error);
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to check payment status'
        }
      };
    }
  }

  /**
   * Validate payment data
   */
  private validatePaymentData(paymentData: PaymentRequest): { code: string; message: string } | null {
    if (!paymentData.amount || paymentData.amount <= 0) {
      return {
        code: 'INVALID_AMOUNT',
        message: 'Payment amount must be greater than 0'
      };
    }

    if (paymentData.amount > 10000000) {
      return {
        code: 'AMOUNT_TOO_HIGH',
        message: 'Payment amount exceeds maximum limit'
      };
    }

    if (paymentData.currency && !['NGN', 'USD', 'EUR'].includes(paymentData.currency)) {
      return {
        code: 'INVALID_CURRENCY',
        message: 'Unsupported currency'
      };
    }

    return null;
  }

  /**
   * Process payment with Paystack
   */
  async processPaymentWithPaystack(
    endpoint: string, 
    paymentData: PaymentRequest
  ): Promise<PaymentResponse> {
    try {
      // Validate endpoint ownership
      const validation = await validateEndpointOwnership(endpoint);
      
      if (!validation.isValid) {
        return {
          success: false,
          error: {
            code: 'INVALID_ENDPOINT',
            message: 'Payment endpoint is invalid or does not exist'
          }
        };
      }

      if (!validation.userId) {
        return {
          success: false,
          error: {
            code: 'INVALID_USER',
            message: 'Unable to identify user for this endpoint'
          }
        };
      }

      // Validate payment data
      const validationError = this.validatePaymentData(paymentData);
      if (validationError) {
        return {
          success: false,
          error: validationError
        };
      }

      // Check if Paystack is configured
      if (!PaystackService.isConfigured()) {
        return {
          success: false,
          error: {
            code: 'PAYSTACK_NOT_CONFIGURED',
            message: 'Paystack is not properly configured'
          }
        };
      }

      // Generate unique reference
      const reference = `PAY_${endpoint}_${Date.now()}`;

      // Create transaction record
      const transactionResult = await transactionService.initializeTransaction(
        validation.userId,
        paymentData.amount,
        'NGN', // Paystack only supports NGN
        'CREDIT',
        {
          description: paymentData.description || `Payment via ${endpoint}`,
          metadata: {
            ...paymentData.metadata,
            paymentEndpoint: endpoint,
            customerEmail: paymentData.customerEmail,
            source: 'PAYSTACK',
            reference
          }
        }
      );

      if (!transactionResult.success) {
        return {
          success: false,
          error: {
            code: 'TRANSACTION_FAILED',
            message: transactionResult.error?.message || 'Failed to initialize transaction'
          }
        };
      }

      // Initialize Paystack transaction
      const paystackRequest = PaystackService.createPaymentRequest(
        paymentData,
        paymentData.customerEmail || validation.userId,
        reference,
        paymentData.redirectUrl
      );

      const paystackResponse = await PaystackService.initializeTransaction(paystackRequest);

      // Update transaction with Paystack reference
      await transactionService.processTransaction(
        transactionResult.data!.reference,
        {
          providerRef: paystackResponse.data.reference,
          metadata: {
            paymentEndpoint: endpoint,
            paystackReference: paystackResponse.data.reference,
            authorizationUrl: paystackResponse.data.authorization_url,
            processedAt: new Date().toISOString()
          }
        }
      );

      // Convert to standard response
      const paymentResponse = PaystackService.convertToPaymentResponse(paystackResponse, reference);
      
      // Update the amount in the response data
      if (paymentResponse.data) {
        paymentResponse.data.amount = paymentData.amount;
      }

      return paymentResponse;

    } catch (error) {
      console.error('Paystack payment processing error:', error);
      return {
        success: false,
        error: {
          code: 'PAYSTACK_ERROR',
          message: `Paystack payment failed: ${error instanceof Error ? error.message : String(error)}`
        }
      };
    }
  }

  /**
   * Verify Paystack payment
   */
  async verifyPaystackPayment(reference: string): Promise<PaymentResponse> {
    try {
      if (!PaystackService.isConfigured()) {
        return {
          success: false,
          error: {
            code: 'PAYSTACK_NOT_CONFIGURED',
            message: 'Paystack is not properly configured'
          }
        };
      }

      const paystackVerification = await PaystackService.verifyTransaction(reference);

      if (!paystackVerification.status) {
        return {
          success: false,
          error: {
            code: 'VERIFICATION_FAILED',
            message: 'Paystack verification failed'
          }
        };
      }

      // Update our transaction status based on Paystack response
      const transaction = await prisma.transaction.findUnique({
        where: { reference }
      });

      if (transaction) {
        const isPaid = paystackVerification.data.status === 'success';
        const newStatus = isPaid ? 'SUCCESS' : 'FAILED';

        // Update transaction status using Prisma directly
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: { 
            status: newStatus,
            updatedAt: new Date()
          }
        });
      }

      return {
        success: true,
        data: {
          reference,
          status: paystackVerification.data.status,
          amount: paystackVerification.data.amount / 100, // Convert from kobo
          currency: paystackVerification.data.currency,
          paidAt: paystackVerification.data.paid_at,
          gatewayResponse: paystackVerification.data.gateway_response
        }
      };

    } catch (error) {
      console.error('Paystack verification error:', error);
      return {
        success: false,
        error: {
          code: 'VERIFICATION_ERROR',
          message: `Paystack verification failed: ${error instanceof Error ? error.message : String(error)}`
        }
      };
    }
  }
}

export const paymentService = new PaymentService();
