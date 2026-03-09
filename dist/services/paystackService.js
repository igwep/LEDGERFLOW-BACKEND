"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaystackService = void 0;
const paystack_1 = __importDefault(require("paystack"));
// Initialize Paystack with sandbox mode
const paystack = (0, paystack_1.default)(process.env.PAYSTACK_SECRET_KEY || 'sk_test_xxxx');
class PaystackService {
    /**
     * Initialize a Paystack transaction
     */
    static async initializeTransaction(request) {
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
            return response;
        }
        catch (error) {
            console.error('❌ Paystack initialization error:', error);
            throw new Error(`Paystack initialization failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Verify a Paystack transaction
     */
    static async verifyTransaction(reference) {
        try {
            console.log('🔍 Verifying Paystack transaction:', reference);
            const response = await paystack.transaction.verify(reference);
            console.log('✅ Paystack transaction verified:', response);
            return response;
        }
        catch (error) {
            console.error('❌ Paystack verification error:', error);
            throw new Error(`Paystack verification failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Create a payment request for Paystack
     */
    static createPaymentRequest(paymentData, customerEmail, reference, callbackUrl) {
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
    static convertToPaymentResponse(paystackResponse, reference) {
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
    static isConfigured() {
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
    static processWebhook(payload) {
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
exports.PaystackService = PaystackService;
//# sourceMappingURL=paystackService.js.map