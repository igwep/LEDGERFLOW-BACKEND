import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
export declare class TransactionController {
    initializeTransaction(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    processTransaction(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getTransaction(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    listTransactions(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    failTransaction(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    reverseTransaction(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getTransactionFraudScore(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
export declare const transactionController: TransactionController;
//# sourceMappingURL=transactionController.d.ts.map