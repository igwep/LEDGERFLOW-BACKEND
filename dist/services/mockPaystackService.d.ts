export declare class MockPaystackService {
    static initializeTransaction(data: any): Promise<{
        status: boolean;
        message: string;
        data: {
            authorization_url: string;
            access_code: string;
            reference: string;
            amount: any;
            currency: string;
            transaction_date: string;
            status: string;
        };
    }>;
    static verifyTransaction(reference: string): Promise<{
        status: boolean;
        message: string;
        data: {
            reference: string;
            amount: number;
            currency: string;
            status: string;
            paid_at: string;
            gateway_response: string;
        };
    }>;
    static isConfigured(): boolean;
    static getEnvironmentInfo(): {
        environment: string;
        isTest: boolean;
        configured: boolean;
    };
}
//# sourceMappingURL=mockPaystackService.d.ts.map