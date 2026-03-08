import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
export declare const generateRequestId: () => `${string}-${string}-${string}-${string}-${string}`;
export declare const requestIdMiddleware: () => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const webhookSignatureVerification: (secret: string) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const rateLimiting: (options: {
    windowMs: number;
    maxRequests: number;
    keyGenerator?: (req: Request) => string;
}) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const corsMiddleware: (options?: {
    origin?: string | string[];
    methods?: string[];
    allowedHeaders?: string[];
    credentials?: boolean;
}) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=common.d.ts.map