"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockPaystackService = void 0;
// Mock Paystack Service for Testing
class MockPaystackService {
    static async initializeTransaction(data) {
        // Generate mock response
        const reference = `MOCK_${Date.now()}`;
        return {
            status: true,
            message: 'Authorization URL created',
            data: {
                authorization_url: `https://checkout.paystack.com/mock/${reference}`,
                access_code: `mock_${reference}`,
                reference: reference,
                amount: data.amount,
                currency: 'NGN',
                transaction_date: new Date().toISOString(),
                status: 'pending'
            }
        };
    }
    static async verifyTransaction(reference) {
        return {
            status: true,
            message: 'Verification successful',
            data: {
                reference: reference,
                amount: 5000,
                currency: 'NGN',
                status: 'success',
                paid_at: new Date().toISOString(),
                gateway_response: 'Successful'
            }
        };
    }
    static isConfigured() {
        return true; // Always configured for testing
    }
    static getEnvironmentInfo() {
        return {
            environment: 'mock',
            isTest: true,
            configured: true
        };
    }
}
exports.MockPaystackService = MockPaystackService;
//# sourceMappingURL=mockPaystackService.js.map