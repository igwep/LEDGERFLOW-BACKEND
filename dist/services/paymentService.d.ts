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
export declare class PaymentService {
    /**
     * Process payment via unique endpoint
     */
    processPayment(endpoint: string, paymentData: PaymentRequest): Promise<PaymentResponse>;
    /**
     * Get payment status
     */
    getPaymentStatus(reference: string): Promise<PaymentResponse>;
    /**
     * Validate payment data
     */
    private validatePaymentData;
}
export declare const paymentService: PaymentService;
//# sourceMappingURL=paymentService.d.ts.map