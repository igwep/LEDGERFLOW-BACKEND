import { ServiceResponse, WalletData, LedgerEntryData } from '../types';
export declare class WalletService {
    createWallet(userId: string, currency?: string): Promise<ServiceResponse<WalletData>>;
    getWallet(userId: string): Promise<ServiceResponse<WalletData>>;
    processDoubleEntryTransaction(walletId: string, transactionId: string, amount: number, type: 'CREDIT' | 'DEBIT', description?: string, reference?: string): Promise<ServiceResponse<LedgerEntryData[]>>;
    lockFunds(walletId: string, amount: number, description?: string): Promise<ServiceResponse<WalletData>>;
    unlockFunds(walletId: string, amount: number, description?: string): Promise<ServiceResponse<WalletData>>;
    getLedgerEntries(walletId: string, options?: {
        limit?: number;
        offset?: number;
        type?: 'CREDIT' | 'DEBIT';
        startDate?: Date;
        endDate?: Date;
    }): Promise<ServiceResponse<{
        entries: LedgerEntryData[];
        total: number;
    }>>;
    private createLedgerEntries;
    private mapWalletToData;
    private mapLedgerEntryToData;
}
export declare const walletService: WalletService;
//# sourceMappingURL=walletService.d.ts.map