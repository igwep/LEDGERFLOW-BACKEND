import { ServiceResponse, WithdrawalData } from '../types';
export declare class WithdrawalService {
    createWithdrawal(userId: string, amount: number, bankName: string, accountNumber: string, accountName: string, options?: {
        description?: string;
        idempotencyKey?: string;
    }): Promise<ServiceResponse<WithdrawalData>>;
    processWithdrawal(withdrawalId: string, status: 'PROCESSING' | 'SUCCESS' | 'FAILED', options?: {
        transferRef?: string;
        metadata?: Record<string, any>;
    }): Promise<ServiceResponse<WithdrawalData>>;
    getWithdrawal(withdrawalId: string): Promise<ServiceResponse<WithdrawalData>>;
    listWithdrawals(userId: string, options?: {
        status?: string;
        limit?: number;
        offset?: number;
        startDate?: Date;
        endDate?: Date;
    }): Promise<ServiceResponse<{
        withdrawals: WithdrawalData[];
        total: number;
    }>>;
    cancelWithdrawal(withdrawalId: string, reason?: string): Promise<ServiceResponse<WithdrawalData>>;
    getWithdrawalStats(userId: string, options?: {
        startDate?: Date;
        endDate?: Date;
    }): Promise<ServiceResponse<{
        totalWithdrawals: number;
        totalAmount: number;
        pendingWithdrawals: number;
        processingWithdrawals: number;
        completedWithdrawals: number;
        failedWithdrawals: number;
    }>>;
    private generateTransferReference;
    private mapWithdrawalToData;
}
export declare const withdrawalService: WithdrawalService;
//# sourceMappingURL=withdrawalService.d.ts.map