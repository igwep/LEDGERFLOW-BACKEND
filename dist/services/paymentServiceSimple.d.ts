export interface SimplePaymentResponse {
    success: boolean;
    data?: {
        reference: string;
        authorization_url: string;
        access_code: string;
        amount: number;
        currency: string;
    };
    error?: {
        code: string;
        message: string;
    };
}
export declare class SimplePaymentService {
    static processPaymentWithPaystack(endpoint: string, amount: number, email: string, description?: string, redirectUrl?: string): Promise<SimplePaymentResponse>;
}
//# sourceMappingURL=paymentServiceSimple.d.ts.map