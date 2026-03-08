import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
export declare class WithdrawalController {
    createWithdrawal(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    processWithdrawal(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getWithdrawal(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    listWithdrawals(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    cancelWithdrawal(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getWithdrawalStats(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
export declare const withdrawalController: WithdrawalController;
//# sourceMappingURL=withdrawalController.d.ts.map