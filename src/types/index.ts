import { Request, Response, NextFunction } from 'express';
const { PrismaClient } = require('@prisma/client');

// Database types
export type DatabaseClient = InstanceType<typeof PrismaClient>;

// Request/Response types
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

// Transaction types
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

// Service response types
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

// Error types
export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public isOperational: boolean;
  public details?: any;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR', details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = statusCode < 500;
    this.details = details;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
  }
}

export class InsufficientFundsError extends AppError {
  constructor(message: string = 'Insufficient funds') {
    super(message, 400, 'INSUFFICIENT_FUNDS');
  }
}

export class WalletLockedError extends AppError {
  constructor(message: string = 'Wallet is locked') {
    super(message, 423, 'WALLET_LOCKED');
  }
}

export class IdempotencyError extends AppError {
  constructor(message: string = 'Idempotency key conflict') {
    super(message, 409, 'IDEMPOTENCY_CONFLICT');
  }
}

export class FraudDetectionError extends AppError {
  constructor(message: string = 'Transaction flagged for fraud') {
    super(message, 403, 'FRAUD_DETECTED');
  }
}

export class WebhookSignatureError extends AppError {
  constructor(message: string = 'Invalid webhook signature') {
    super(message, 401, 'INVALID_SIGNATURE');
  }
}

// Middleware types
export type MiddlewareFunction = (req: AuthenticatedRequest, res: Response, next: NextFunction) => void | Promise<void>;

// Provider types
export interface PaymentProvider {
  name: string;
  initializeTransaction(data: any): Promise<any>;
  verifySignature(payload: string, signature: string): boolean;
  processWebhook(payload: any): Promise<any>;
}

// Fraud detection types
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

// Configuration types
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

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
