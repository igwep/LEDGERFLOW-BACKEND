import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
export declare class WalletController {
    createWallet(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getWallet(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getLedgerEntries(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    lockFunds(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    unlockFunds(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getWalletBalance(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
export declare const walletController: WalletController;
//# sourceMappingURL=walletController.d.ts.map