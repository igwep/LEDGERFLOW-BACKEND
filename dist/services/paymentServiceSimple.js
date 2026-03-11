"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimplePaymentService = void 0;
// Simplified payment service for testing without complex transactions
const paystackService_1 = require("./paystackService");
const endpointGenerator_1 = require("../utils/endpointGenerator");
class SimplePaymentService {
    static async processPaymentWithPaystack(endpoint, amount, email, description, redirectUrl) {
        try {
            console.log('🔍 Starting simple Paystack payment...');
            console.log('Endpoint:', endpoint);
            console.log('Amount:', amount);
            console.log('Email:', email);
            // Validate endpoint ownership (simplified)
            const validation = await (0, endpointGenerator_1.validateEndpointOwnership)(endpoint);
            if (!validation.isValid) {
                return {
                    success: false,
                    error: {
                        code: 'INVALID_ENDPOINT',
                        message: 'Payment endpoint is invalid or does not exist'
                    }
                };
            }
            // Check if Paystack is configured
            if (!paystackService_1.PaystackService.isConfigured()) {
                return {
                    success: false,
                    error: {
                        code: 'PAYSTACK_NOT_CONFIGURED',
                        message: 'Paystack is not configured'
                    }
                };
            }
            // Generate reference
            const reference = `PAY_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            console.log('📦 Generated reference:', reference);
            // Initialize transaction with Paystack
            const paystackResponse = await paystackService_1.PaystackService.initializeTransaction({
                email,
                amount: amount * 100, // Convert to kobo
                reference,
                callback_url: redirectUrl,
                metadata: {
                    description: description || 'Payment via LedgerFlow',
                    endpoint,
                    custom_fields: [
                        {
                            display_name: "Payment Endpoint",
                            variable_name: "payment_endpoint",
                            value: endpoint
                        }
                    ]
                }
            });
            if (!paystackResponse.status || !paystackResponse.data) {
                console.error('❌ Paystack initialization failed:', paystackResponse);
                return {
                    success: false,
                    error: {
                        code: 'PAYSTACK_INITIALIZATION_FAILED',
                        message: paystackResponse.message || 'Failed to initialize Paystack transaction'
                    }
                };
            }
            console.log('✅ Paystack transaction initialized successfully');
            console.log('Reference:', paystackResponse.data.reference);
            console.log('Authorization URL:', paystackResponse.data.authorization_url);
            // Return success response
            return {
                success: true,
                data: {
                    reference: paystackResponse.data.reference,
                    authorization_url: paystackResponse.data.authorization_url,
                    access_code: paystackResponse.data.access_code,
                    amount: amount,
                    currency: 'NGN'
                }
            };
        }
        catch (error) {
            console.error('❌ Paystack payment failed:', error);
            return {
                success: false,
                error: {
                    code: 'PAYSTACK_ERROR',
                    message: `Paystack payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`
                }
            };
        }
    }
}
exports.SimplePaymentService = SimplePaymentService;
//# sourceMappingURL=paymentServiceSimple.js.map