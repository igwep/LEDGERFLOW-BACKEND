import { z } from 'zod';

// Common schemas
export const DecimalSchema = z.string().transform((val) => {
  const num = parseFloat(val);
  if (isNaN(num) || num < 0) {
    throw new Error('Invalid decimal value');
  }
  return num;
});

export const UUIDSchema = z.string().uuid();

// Wallet schemas
export const CreateWalletSchema = z.object({
  userId: UUIDSchema,
  currency: z.string().min(3).max(3).default('NGN'),
});

export const GetWalletSchema = z.object({
  userId: UUIDSchema,
});

// Transaction schemas
export const InitializeTransactionSchema = z.object({
  userId: UUIDSchema,
  amount: z.string().min(1), // Will be transformed to Decimal
  currency: z.string().min(3).max(3).default('NGN'),
  type: z.enum(['CREDIT', 'DEBIT']),
  description: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  idempotencyKey: z.string().optional(),
  provider: z.string().optional(),
  expiresAt: z.string().datetime({ offset: true }).optional(),
});

export const GetTransactionSchema = z.object({
  reference: z.string().min(1),
});

export const ListTransactionsSchema = z.object({
  userId: UUIDSchema,
  status: z.enum(['PENDING', 'SUCCESS', 'FAILED', 'REVERSED']).optional(),
  type: z.enum(['CREDIT', 'DEBIT']).optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
  startDate: z.string().datetime({ offset: true }).optional(),
  endDate: z.string().datetime({ offset: true }).optional(),
});

// Withdrawal schemas
export const CreateWithdrawalSchema = z.object({
  userId: UUIDSchema,
  amount: z.string().min(1), // Will be transformed to Decimal
  bankName: z.string().min(1),
  accountNumber: z.string().min(10).max(10),
  accountName: z.string().min(1),
  description: z.string().optional(),
  idempotencyKey: z.string().optional(),
});

export const ProcessWithdrawalSchema = z.object({
  withdrawalId: UUIDSchema,
  status: z.enum(['PROCESSING', 'SUCCESS', 'FAILED']),
  transferRef: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

// Webhook schemas
export const WebhookEventSchema = z.object({
  provider: z.string().min(1),
  eventType: z.string().min(1),
  payload: z.record(z.string(), z.any()),
  signature: z.string().optional(),
});

export const ProcessWebhookSchema = z.object({
  eventId: UUIDSchema,
});

// Fraud scoring schemas
export const FraudScoreSchema = z.object({
  transactionId: UUIDSchema,
  score: z.number().min(0).max(100),
  level: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  factors: z.record(z.string(), z.any()).optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  deviceId: z.string().optional(),
  location: z.record(z.string(), z.any()).optional(),
  reason: z.string().optional(),
});

// Query parameter schemas
export const PaginationSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

export const DateRangeSchema = z.object({
  startDate: z.string().datetime({ offset: true }).optional(),
  endDate: z.string().datetime({ offset: true }).optional(),
});

// Response schemas
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional(),
  }).optional(),
  meta: z.object({
    timestamp: z.string().datetime({ offset: true }),
    requestId: z.string(),
    pagination: z.object({
      limit: z.number(),
      offset: z.number(),
      total: z.number().optional(),
      hasMore: z.boolean().optional(),
    }).optional(),
  }),
});

// Error schemas
export const ErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional(),
    validationErrors: z.array(z.object({
      field: z.string(),
      message: z.string(),
    })).optional(),
  }),
  meta: z.object({
    timestamp: z.string().datetime({ offset: true }),
    requestId: z.string(),
  }),
});

// Type exports
export type CreateWalletInput = z.infer<typeof CreateWalletSchema>;
export type GetWalletInput = z.infer<typeof GetWalletSchema>;
export type InitializeTransactionInput = z.infer<typeof InitializeTransactionSchema>;
export type GetTransactionInput = z.infer<typeof GetTransactionSchema>;
export type ListTransactionsInput = z.infer<typeof ListTransactionsSchema>;
export type CreateWithdrawalInput = z.infer<typeof CreateWithdrawalSchema>;
export type ProcessWithdrawalInput = z.infer<typeof ProcessWithdrawalSchema>;
export type WebhookEventInput = z.infer<typeof WebhookEventSchema>;
export type ProcessWebhookInput = z.infer<typeof ProcessWebhookSchema>;
export type FraudScoreInput = z.infer<typeof FraudScoreSchema>;
export type PaginationInput = z.infer<typeof PaginationSchema>;
export type DateRangeInput = z.infer<typeof DateRangeSchema>;
