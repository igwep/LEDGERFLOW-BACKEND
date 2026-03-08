"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorResponseSchema = exports.ApiResponseSchema = exports.DateRangeSchema = exports.PaginationSchema = exports.FraudScoreSchema = exports.ProcessWebhookSchema = exports.WebhookEventSchema = exports.ProcessWithdrawalSchema = exports.CreateWithdrawalSchema = exports.ListTransactionsSchema = exports.GetTransactionSchema = exports.InitializeTransactionSchema = exports.GetWalletSchema = exports.CreateWalletSchema = exports.UUIDSchema = exports.DecimalSchema = void 0;
const zod_1 = require("zod");
// Common schemas
exports.DecimalSchema = zod_1.z.string().transform((val) => {
    const num = parseFloat(val);
    if (isNaN(num) || num < 0) {
        throw new Error('Invalid decimal value');
    }
    return num;
});
exports.UUIDSchema = zod_1.z.string().uuid();
// Wallet schemas
exports.CreateWalletSchema = zod_1.z.object({
    userId: exports.UUIDSchema,
    currency: zod_1.z.string().min(3).max(3).default('NGN'),
});
exports.GetWalletSchema = zod_1.z.object({
    userId: exports.UUIDSchema,
});
// Transaction schemas
exports.InitializeTransactionSchema = zod_1.z.object({
    userId: exports.UUIDSchema,
    amount: zod_1.z.string().min(1), // Will be transformed to Decimal
    currency: zod_1.z.string().min(3).max(3).default('NGN'),
    type: zod_1.z.enum(['CREDIT', 'DEBIT']),
    description: zod_1.z.string().optional(),
    metadata: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
    idempotencyKey: zod_1.z.string().optional(),
    provider: zod_1.z.string().optional(),
    expiresAt: zod_1.z.string().datetime({ offset: true }).optional(),
});
exports.GetTransactionSchema = zod_1.z.object({
    reference: zod_1.z.string().min(1),
});
exports.ListTransactionsSchema = zod_1.z.object({
    userId: exports.UUIDSchema,
    status: zod_1.z.enum(['PENDING', 'SUCCESS', 'FAILED', 'REVERSED']).optional(),
    type: zod_1.z.enum(['CREDIT', 'DEBIT']).optional(),
    limit: zod_1.z.coerce.number().min(1).max(100).default(20),
    offset: zod_1.z.coerce.number().min(0).default(0),
    startDate: zod_1.z.string().datetime({ offset: true }).optional(),
    endDate: zod_1.z.string().datetime({ offset: true }).optional(),
});
// Withdrawal schemas
exports.CreateWithdrawalSchema = zod_1.z.object({
    userId: exports.UUIDSchema,
    amount: zod_1.z.string().min(1), // Will be transformed to Decimal
    bankName: zod_1.z.string().min(1),
    accountNumber: zod_1.z.string().min(10).max(10),
    accountName: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    idempotencyKey: zod_1.z.string().optional(),
});
exports.ProcessWithdrawalSchema = zod_1.z.object({
    withdrawalId: exports.UUIDSchema,
    status: zod_1.z.enum(['PROCESSING', 'SUCCESS', 'FAILED']),
    transferRef: zod_1.z.string().optional(),
    metadata: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
});
// Webhook schemas
exports.WebhookEventSchema = zod_1.z.object({
    provider: zod_1.z.string().min(1),
    eventType: zod_1.z.string().min(1),
    payload: zod_1.z.record(zod_1.z.string(), zod_1.z.any()),
    signature: zod_1.z.string().optional(),
});
exports.ProcessWebhookSchema = zod_1.z.object({
    eventId: exports.UUIDSchema,
});
// Fraud scoring schemas
exports.FraudScoreSchema = zod_1.z.object({
    transactionId: exports.UUIDSchema,
    score: zod_1.z.number().min(0).max(100),
    level: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH']),
    factors: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
    ipAddress: zod_1.z.string().optional(),
    userAgent: zod_1.z.string().optional(),
    deviceId: zod_1.z.string().optional(),
    location: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
    reason: zod_1.z.string().optional(),
});
// Query parameter schemas
exports.PaginationSchema = zod_1.z.object({
    limit: zod_1.z.coerce.number().min(1).max(100).default(20),
    offset: zod_1.z.coerce.number().min(0).default(0),
});
exports.DateRangeSchema = zod_1.z.object({
    startDate: zod_1.z.string().datetime({ offset: true }).optional(),
    endDate: zod_1.z.string().datetime({ offset: true }).optional(),
});
// Response schemas
exports.ApiResponseSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    data: zod_1.z.any().optional(),
    error: zod_1.z.object({
        code: zod_1.z.string(),
        message: zod_1.z.string(),
        details: zod_1.z.any().optional(),
    }).optional(),
    meta: zod_1.z.object({
        timestamp: zod_1.z.string().datetime({ offset: true }),
        requestId: zod_1.z.string(),
        pagination: zod_1.z.object({
            limit: zod_1.z.number(),
            offset: zod_1.z.number(),
            total: zod_1.z.number().optional(),
            hasMore: zod_1.z.boolean().optional(),
        }).optional(),
    }),
});
// Error schemas
exports.ErrorResponseSchema = zod_1.z.object({
    success: zod_1.z.literal(false),
    error: zod_1.z.object({
        code: zod_1.z.string(),
        message: zod_1.z.string(),
        details: zod_1.z.any().optional(),
        validationErrors: zod_1.z.array(zod_1.z.object({
            field: zod_1.z.string(),
            message: zod_1.z.string(),
        })).optional(),
    }),
    meta: zod_1.z.object({
        timestamp: zod_1.z.string().datetime({ offset: true }),
        requestId: zod_1.z.string(),
    }),
});
//# sourceMappingURL=validation.js.map