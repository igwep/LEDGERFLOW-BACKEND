import Paystack from 'paystack';
import { PaymentRequest, PaymentResponse } from './paymentService';

// Initialize Paystack with sandbox mode
const paystack = Paystack(process.env.PAYSTACK_SECRET_KEY || 'sk_test_xxxx');

export interface PaystackTransactionRequest {
  email: string;
  amount: number; // in kobo (Naira * 100)
  reference: string;
  callback_url?: string;
  metadata?: Record<string, any>;
}

export interface PaystackTransactionResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackVerificationResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    message: string;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: Record<string, any>;
  };
}

export class PaystackService {
  
  /**
   * Initialize a Paystack transaction
   */
  static async initializeTransaction(
    request: PaystackTransactionRequest
  ): Promise<PaystackTransactionResponse> {
    try {
      console.log('🏦 Initializing Paystack transaction:', request);
      
      const response = await paystack.transaction.initialize({
        email: request.email,
        amount: request.amount,
        reference: request.reference,
        name: request.email.split('@')[0] || 'Customer', // Use email prefix as name
        callback_url: request.callback_url,
        metadata: request.metadata
      });

      console.log('✅ Paystack transaction initialized:', response);
      return response as PaystackTransactionResponse;
    } catch (error) {
      console.error('❌ Paystack initialization error:', error);
      throw new Error(`Paystack initialization failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Verify a Paystack transaction
   */
  static async verifyTransaction(reference: string): Promise<PaystackVerificationResponse> {
    try {
      console.log('🔍 Verifying Paystack transaction:', reference);
      
      const response = await paystack.transaction.verify(reference);
      
      console.log('✅ Paystack transaction verified:', response);
      return response as PaystackVerificationResponse;
    } catch (error) {
      console.error('❌ Paystack verification error:', error);
      throw new Error(`Paystack verification failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Create a payment request for Paystack
   */
  static createPaymentRequest(
    paymentData: PaymentRequest,
    customerEmail: string,
    reference: string,
    callbackUrl?: string
  ): PaystackTransactionRequest {
    // Convert amount to kobo (Paystack expects amount in smallest currency unit)
    const amountInKobo = paymentData.amount * 100;

    return {
      email: customerEmail,
      amount: amountInKobo,
      reference,
      callback_url: callbackUrl,
      metadata: {
        description: paymentData.description,
        customerEmail: paymentData.customerEmail,
        redirectUrl: paymentData.redirectUrl,
        originalAmount: paymentData.amount,
        currency: 'NGN'
      }
    };
  }

  /**
   * Convert Paystack response to our standard PaymentResponse
   */
  static convertToPaymentResponse(
    paystackResponse: PaystackTransactionResponse,
    reference: string
  ): PaymentResponse {
    return {
      success: true,
      data: {
        reference,
        status: 'pending',
        amount: 0, // Will be set by caller
        currency: 'NGN',
        redirectUrl: paystackResponse.data.authorization_url,
        gatewayReference: paystackResponse.data.reference,
        gateway: 'paystack',
        message: 'Payment initialized successfully'
      }
    };
  }

  /**
   * Check if Paystack is configured
   */
  static isConfigured(): boolean {
    return !!(process.env.PAYSTACK_SECRET_KEY);
  }

  /**
   * Get Paystack environment info
   */
  static getEnvironmentInfo() {
    const secretKey = process.env.PAYSTACK_SECRET_KEY || '';
    const isTest = secretKey.startsWith('sk_test_');
    
    return {
      provider: 'paystack',
      environment: isTest ? 'sandbox' : 'production',
      configured: this.isConfigured(),
      currency: 'NGN'
    };
  }

  /**
   * Process Paystack webhook
   */
  static processWebhook(payload: any): {
    event: string;
    data: any;
    processed: boolean;
  } {
    console.log('🏦 Processing Paystack webhook:', payload);
    
    const event = payload.event || 'unknown';
    const data = payload.data || {};
    
    return {
      event,
      data,
      processed: true
    };
  }
}
