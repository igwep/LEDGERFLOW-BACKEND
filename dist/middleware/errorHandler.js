"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.notFoundHandler = exports.errorHandler = void 0;
const zod_1 = require("zod");
const types_1 = require("../types");
const errorHandler = (error, req, res, next) => {
    const requestId = req.requestId || 'unknown';
    const timestamp = new Date().toISOString();
    // Log error for debugging
    console.error(`[${requestId}] Error:`, {
        message: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        body: req.body,
        query: req.query,
        params: req.params,
    });
    // Handle different error types
    if (error instanceof zod_1.ZodError) {
        const validationErrors = error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message,
        }));
        return res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Validation failed',
                details: validationErrors,
            },
            meta: {
                timestamp,
                requestId,
            },
        });
    }
    if (error instanceof types_1.ValidationError) {
        return res.status(400).json({
            success: false,
            error: {
                code: error.code,
                message: error.message,
                details: error.details,
            },
            meta: {
                timestamp,
                requestId,
            },
        });
    }
    if (error instanceof types_1.NotFoundError) {
        return res.status(404).json({
            success: false,
            error: {
                code: error.code,
                message: error.message,
            },
            meta: {
                timestamp,
                requestId,
            },
        });
    }
    if (error instanceof types_1.ConflictError) {
        return res.status(409).json({
            success: false,
            error: {
                code: error.code,
                message: error.message,
            },
            meta: {
                timestamp,
                requestId,
            },
        });
    }
    if (error instanceof types_1.InsufficientFundsError) {
        return res.status(400).json({
            success: false,
            error: {
                code: error.code,
                message: error.message,
            },
            meta: {
                timestamp,
                requestId,
            },
        });
    }
    if (error instanceof types_1.WalletLockedError) {
        return res.status(423).json({
            success: false,
            error: {
                code: error.code,
                message: error.message,
            },
            meta: {
                timestamp,
                requestId,
            },
        });
    }
    if (error instanceof types_1.IdempotencyError) {
        return res.status(409).json({
            success: false,
            error: {
                code: error.code,
                message: error.message,
            },
            meta: {
                timestamp,
                requestId,
            },
        });
    }
    if (error instanceof types_1.FraudDetectionError) {
        return res.status(403).json({
            success: false,
            error: {
                code: error.code,
                message: error.message,
            },
            meta: {
                timestamp,
                requestId,
            },
        });
    }
    if (error instanceof types_1.WebhookSignatureError) {
        return res.status(401).json({
            success: false,
            error: {
                code: error.code,
                message: error.message,
            },
            meta: {
                timestamp,
                requestId,
            },
        });
    }
    if (error instanceof types_1.AppError) {
        return res.status(error.statusCode).json({
            success: false,
            error: {
                code: error.code,
                message: error.message,
                details: error.details,
            },
            meta: {
                timestamp,
                requestId,
            },
        });
    }
    // Handle Prisma errors
    if (error.name === 'PrismaClientKnownRequestError') {
        const prismaError = error;
        switch (prismaError.code) {
            case 'P2002':
                return res.status(409).json({
                    success: false,
                    error: {
                        code: 'UNIQUE_CONSTRAINT_VIOLATION',
                        message: 'Resource already exists',
                        details: prismaError.meta,
                    },
                    meta: {
                        timestamp,
                        requestId,
                    },
                });
            case 'P2025':
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Resource not found',
                    },
                    meta: {
                        timestamp,
                        requestId,
                    },
                });
            default:
                return res.status(500).json({
                    success: false,
                    error: {
                        code: 'DATABASE_ERROR',
                        message: 'Database operation failed',
                        details: prismaError.code,
                    },
                    meta: {
                        timestamp,
                        requestId,
                    },
                });
        }
    }
    // Default error response
    res.status(500).json({
        success: false,
        error: {
            code: 'INTERNAL_ERROR',
            message: 'Internal server error',
        },
        meta: {
            timestamp,
            requestId,
        },
    });
};
exports.errorHandler = errorHandler;
const notFoundHandler = (req, res) => {
    const requestId = req.headers['x-request-id'] || 'unknown';
    const timestamp = new Date().toISOString();
    res.status(404).json({
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: `Route ${req.method} ${req.path} not found`,
        },
        meta: {
            timestamp,
            requestId,
        },
    });
};
exports.notFoundHandler = notFoundHandler;
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
//# sourceMappingURL=errorHandler.js.map