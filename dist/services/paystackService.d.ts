import { PaymentRequest, PaymentResponse } from './paymentService';
export interface PaystackTransactionRequest {
    email: string;
    amount: number;
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
export declare class PaystackService {
    /**
     * Initialize a Paystack transaction
     */
    static initializeTransaction(request: PaystackTransactionRequest): Promise<PaystackTransactionResponse>;
    /**
     * Verify a Paystack transaction
     */
    static verifyTransaction(reference: string): Promise<PaystackVerificationResponse>;
    /**
     * Create a payment request for Paystack
     */
    static createPaymentRequest(paymentData: PaymentRequest, customerEmail: string, reference: string, callbackUrl?: string): PaystackTransactionRequest;
    /**
     * Convert Paystack response to our standard PaymentResponse
     */
    static convertToPaymentResponse(paystackResponse: PaystackTransactionResponse, reference: string): PaymentResponse;
    /**
     * Check if Paystack is configured
     */
    static isConfigured(): boolean;
    /**
     * Get Paystack environment info
     */
    static getEnvironmentInfo(): {
        provider: string;
        environment: string;
        configured: boolean;
        currency: string;
    };
    /**
     * Process Paystack webhook
     */
    static processWebhook(payload: any): {
        event: string;
        data: any;
        processed: boolean;
    };
}
//# sourceMappingURL=paystackService.d.ts.map