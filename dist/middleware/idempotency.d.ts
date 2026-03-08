import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
export declare const idempotencyProtection: (ttlMinutes?: number) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
export declare const cacheIdempotentResponse: (idempotencyKey: string, response: any, statusCode: number) => () => Promise<void>;
export declare const cleanupExpiredIdempotencyKeys: () => Promise<void>;
//# sourceMappingURL=idempotency.d.ts.map