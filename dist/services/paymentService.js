"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentService = exports.PaymentService = void 0;
const client_1 = require("@prisma/client");
const endpointGenerator_1 = require("../utils/endpointGenerator");
const transactionService_1 = require("./transactionService");
const prisma = new client_1.PrismaClient();
class PaymentService {
    /**
     * Process payment via unique endpoint
     */
    async processPayment(endpoint, paymentData) {
        try {
            // Validate endpoint ownership
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
            const transactionResult = await transactionService_1.transactionService.initializeTransaction(validation.userId, paymentData.amount, paymentData.currency || 'NGN', 'CREDIT', {
                description: paymentData.description || `Payment via ${endpoint}`,
                metadata: {
                    ...paymentData.metadata,
                    paymentEndpoint: endpoint,
                    customerEmail: paymentData.customerEmail,
                    source: 'PAYMENT_ENDPOINT'
                }
            });
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
            const processResult = await transactionService_1.transactionService.processTransaction(transactionResult.data.reference, {
                providerRef: `PAY_${endpoint}_${Date.now()}`,
                metadata: {
                    paymentEndpoint: endpoint,
                    processedAt: new Date().toISOString()
                }
            });
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
                    reference: transactionResult.data.reference,
                    amount: paymentData.amount,
                    currency: paymentData.currency || 'NGN',
                    status: 'SUCCESS',
                    redirectUrl: paymentData.redirectUrl || `https://your-site.com/payment/success?ref=${transactionResult.data.reference}`,
                    createdAt: new Date().toISOString()
                }
            };
        }
        catch (error) {
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
    async getPaymentStatus(reference) {
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
        }
        catch (error) {
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
    validatePaymentData(paymentData) {
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
}
exports.PaymentService = PaymentService;
exports.paymentService = new PaymentService();
//# sourceMappingURL=paymentService.js.map