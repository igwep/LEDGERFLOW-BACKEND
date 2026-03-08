import { Request, Response, NextFunction } from 'express';
declare const PrismaClient: any;
export type DatabaseClient = InstanceType<typeof PrismaClient>;
export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
    };
    requestId?: string;
    idempotencyKey?: string;
}
export interface WalletRequest extends AuthenticatedRequest {
    wallet?: {
        id: string;
        userId: string;
        balance: number;
        available: number;
        lockedBalance: number;
        currency: string;
        status: string;
        version: number;
    };
}
export interface TransactionData {
    id: string;
    reference: string;
    userId: string;
    amount: number;
    currency: string;
    type: 'CREDIT' | 'DEBIT';
    status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REVERSED';
    provider?: string;
    providerRef?: string;
    description?: string;
    metadata?: Record<string, any>;
    idempotencyKey?: string;
    processedAt?: Date;
    expiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export interface LedgerEntryData {
    id: string;
    walletId: string;
    transactionId: string;
    type: 'CREDIT' | 'DEBIT';
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    description?: string;
    reference?: string;
    createdAt: Date;
}
export interface WalletData {
    id: string;
    userId: string;
    balance: number;
    available: number;
    lockedBalance: number;
    currency: string;
    status: string;
    version: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface FraudScoreData {
    id: string;
    walletId: string;
    transactionId: string;
    score: number;
    level: 'LOW' | 'MEDIUM' | 'HIGH';
    flagged: boolean;
    factors?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    deviceId?: string;
    location?: Record<string, any>;
    reason?: string;
    createdAt: Date;
}
export interface WithdrawalData {
    id: string;
    userId: string;
    amount: number;
    status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED';
    bankName: string;
    accountNumber: string;
    transferRef?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface WebhookEventData {
    id: string;
    provider: string;
    eventType: string;
    payload: Record<string, any>;
    signature?: string;
    processed: boolean;
    processingAttempts: number;
    error?: string;
    processedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export interface IdempotencyKeyData {
    id: string;
    key: string;
    transactionId?: string;
    response?: Record<string, any>;
    statusCode?: number;
    expiresAt?: Date;
    createdAt: Date;
}
export interface ServiceResponse<T = any> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
    meta?: {
        pagination?: {
            limit: number;
            offset: number;
            total?: number;
            hasMore?: boolean;
        };
    };
}
export declare class AppError extends Error {
    statusCode: number;
    code: string;
    isOperational: boolean;
    details?: any;
    constructor(message: string, statusCode?: number, code?: string, details?: any);
}
export declare class ValidationError extends AppError {
    constructor(message: string, details?: any);
}
export declare class NotFoundError extends AppError {
    constructor(resource: string);
}
export declare class ConflictError extends AppError {
    constructor(message: string);
}
export declare class InsufficientFundsError extends AppError {
    constructor(message?: string);
}
export declare class WalletLockedError extends AppError {
    constructor(message?: string);
}
export declare class IdempotencyError extends AppError {
    constructor(message?: string);
}
export declare class FraudDetectionError extends AppError {
    constructor(message?: string);
}
export declare class WebhookSignatureError extends AppError {
    constructor(message?: string);
}
export type MiddlewareFunction = (req: AuthenticatedRequest, res: Response, next: NextFunction) => void | Promise<void>;
export interface PaymentProvider {
    name: string;
    initializeTransaction(data: any): Promise<any>;
    verifySignature(payload: string, signature: string): boolean;
    processWebhook(payload: any): Promise<any>;
}
export interface FraudDetectionResult {
    score: number;
    level: 'LOW' | 'MEDIUM' | 'HIGH';
    factors: Record<string, any>;
    flagged: boolean;
    reason?: string;
}
export interface FraudContext {
    userId: string;
    amount: number;
    currency: string;
    type: 'CREDIT' | 'DEBIT' | 'WITHDRAWAL';
    ipAddress?: string;
    userAgent?: string;
    deviceId?: string;
    location?: Record<string, any>;
    transactionHistory?: TransactionData[];
}
export interface AppConfig {
    database: {
        url: string;
    };
    server: {
        port: number;
        host: string;
    };
    security: {
        jwtSecret: string;
        jwtExpiresIn: string;
        webhookSecret: string;
    };
    payment: {
        providers: Record<string, PaymentProvider>;
    };
    fraud: {
        enabled: boolean;
        thresholds: {
            low: number;
            medium: number;
            high: number;
        };
    };
    transactions: {
        expirationMinutes: number;
        maxAmount: number;
        idempotencyTtlMinutes: number;
    };
}
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export {};
//# sourceMappingURL=index.d.ts.map