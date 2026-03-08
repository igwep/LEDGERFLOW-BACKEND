import { Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { AuthenticatedRequest } from '../types';
export declare const validateRequest: (schema: {
    body?: ZodSchema;
    query?: ZodSchema;
    params?: ZodSchema;
}) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const validateBody: (schema: ZodSchema) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const validateQuery: (schema: ZodSchema) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const validateParams: (schema: ZodSchema) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=validation.d.ts.map