import { ServiceResponse, TransactionData } from '../types';
export declare class TransactionService {
    initializeTransaction(userId: string, amount: number, currency: string, type: 'CREDIT' | 'DEBIT', options?: {
        description?: string;
        metadata?: Record<string, any>;
        idempotencyKey?: string;
        provider?: string;
        expiresAt?: Date;
    }): Promise<ServiceResponse<TransactionData>>;
    processTransaction(reference: string, options?: {
        providerRef?: string;
        metadata?: Record<string, any>;
    }): Promise<ServiceResponse<TransactionData>>;
    failTransaction(reference: string, reason?: string): Promise<ServiceResponse<TransactionData>>;
    getTransaction(reference: string): Promise<ServiceResponse<TransactionData>>;
    listTransactions(userId: string, options?: {
        status?: string;
        type?: string;
        limit?: number;
        offset?: number;
        startDate?: Date;
        endDate?: Date;
    }): Promise<ServiceResponse<{
        transactions: TransactionData[];
        total: number;
    }>>;
    reverseTransaction(reference: string, reason?: string): Promise<ServiceResponse<TransactionData>>;
    cleanupExpiredTransactions(): Promise<ServiceResponse<{
        count: number;
    }>>;
    private generateTransactionReference;
    private serializeMetadata;
    private mapTransactionToData;
}
export declare const transactionService: TransactionService;
//# sourceMappingURL=transactionService.d.ts.map