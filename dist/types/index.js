"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookSignatureError = exports.FraudDetectionError = exports.IdempotencyError = exports.WalletLockedError = exports.InsufficientFundsError = exports.ConflictError = exports.NotFoundError = exports.ValidationError = exports.AppError = void 0;
const { PrismaClient } = require('@prisma/client');
// Error types
class AppError extends Error {
    constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = statusCode < 500;
        this.details = details;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
class ValidationError extends AppError {
    constructor(message, details) {
        super(message, 400, 'VALIDATION_ERROR', details);
    }
}
exports.ValidationError = ValidationError;
class NotFoundError extends AppError {
    constructor(resource) {
        super(`${resource} not found`, 404, 'NOT_FOUND');
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends AppError {
    constructor(message) {
        super(message, 409, 'CONFLICT');
    }
}
exports.ConflictError = ConflictError;
class InsufficientFundsError extends AppError {
    constructor(message = 'Insufficient funds') {
        super(message, 400, 'INSUFFICIENT_FUNDS');
    }
}
exports.InsufficientFundsError = InsufficientFundsError;
class WalletLockedError extends AppError {
    constructor(message = 'Wallet is locked') {
        super(message, 423, 'WALLET_LOCKED');
    }
}
exports.WalletLockedError = WalletLockedError;
class IdempotencyError extends AppError {
    constructor(message = 'Idempotency key conflict') {
        super(message, 409, 'IDEMPOTENCY_CONFLICT');
    }
}
exports.IdempotencyError = IdempotencyError;
class FraudDetectionError extends AppError {
    constructor(message = 'Transaction flagged for fraud') {
        super(message, 403, 'FRAUD_DETECTED');
    }
}
exports.FraudDetectionError = FraudDetectionError;
class WebhookSignatureError extends AppError {
    constructor(message = 'Invalid webhook signature') {
        super(message, 401, 'INVALID_SIGNATURE');
    }
}
exports.WebhookSignatureError = WebhookSignatureError;
//# sourceMappingURL=index.js.map