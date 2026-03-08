import { z } from 'zod';
export declare const DecimalSchema: z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>;
export declare const UUIDSchema: z.ZodString;
export declare const CreateWalletSchema: z.ZodObject<{
    userId: z.ZodString;
    currency: z.ZodDefault<z.ZodString>;
}, z.core.$strip>;
export declare const GetWalletSchema: z.ZodObject<{
    userId: z.ZodString;
}, z.core.$strip>;
export declare const InitializeTransactionSchema: z.ZodObject<{
    userId: z.ZodString;
    amount: z.ZodString;
    currency: z.ZodDefault<z.ZodString>;
    type: z.ZodEnum<{
        CREDIT: "CREDIT";
        DEBIT: "DEBIT";
    }>;
    description: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    idempotencyKey: z.ZodOptional<z.ZodString>;
    provider: z.ZodOptional<z.ZodString>;
    expiresAt: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const GetTransactionSchema: z.ZodObject<{
    reference: z.ZodString;
}, z.core.$strip>;
export declare const ListTransactionsSchema: z.ZodObject<{
    userId: z.ZodString;
    status: z.ZodOptional<z.ZodEnum<{
        PENDING: "PENDING";
        SUCCESS: "SUCCESS";
        FAILED: "FAILED";
        REVERSED: "REVERSED";
    }>>;
    type: z.ZodOptional<z.ZodEnum<{
        CREDIT: "CREDIT";
        DEBIT: "DEBIT";
    }>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    offset: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const CreateWithdrawalSchema: z.ZodObject<{
    userId: z.ZodString;
    amount: z.ZodString;
    bankName: z.ZodString;
    accountNumber: z.ZodString;
    accountName: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    idempotencyKey: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const ProcessWithdrawalSchema: z.ZodObject<{
    withdrawalId: z.ZodString;
    status: z.ZodEnum<{
        SUCCESS: "SUCCESS";
        FAILED: "FAILED";
        PROCESSING: "PROCESSING";
    }>;
    transferRef: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, z.core.$strip>;
export declare const WebhookEventSchema: z.ZodObject<{
    provider: z.ZodString;
    eventType: z.ZodString;
    payload: z.ZodRecord<z.ZodString, z.ZodAny>;
    signature: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const ProcessWebhookSchema: z.ZodObject<{
    eventId: z.ZodString;
}, z.core.$strip>;
export declare const FraudScoreSchema: z.ZodObject<{
    transactionId: z.ZodString;
    score: z.ZodNumber;
    level: z.ZodEnum<{
        LOW: "LOW";
        MEDIUM: "MEDIUM";
        HIGH: "HIGH";
    }>;
    factors: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    ipAddress: z.ZodOptional<z.ZodString>;
    userAgent: z.ZodOptional<z.ZodString>;
    deviceId: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    reason: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const PaginationSchema: z.ZodObject<{
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    offset: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export declare const DateRangeSchema: z.ZodObject<{
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const ApiResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    data: z.ZodOptional<z.ZodAny>;
    error: z.ZodOptional<z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
        details: z.ZodOptional<z.ZodAny>;
    }, z.core.$strip>>;
    meta: z.ZodObject<{
        timestamp: z.ZodString;
        requestId: z.ZodString;
        pagination: z.ZodOptional<z.ZodObject<{
            limit: z.ZodNumber;
            offset: z.ZodNumber;
            total: z.ZodOptional<z.ZodNumber>;
            hasMore: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const ErrorResponseSchema: z.ZodObject<{
    success: z.ZodLiteral<false>;
    error: z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
        details: z.ZodOptional<z.ZodAny>;
        validationErrors: z.ZodOptional<z.ZodArray<z.ZodObject<{
            field: z.ZodString;
            message: z.ZodString;
        }, z.core.$strip>>>;
    }, z.core.$strip>;
    meta: z.ZodObject<{
        timestamp: z.ZodString;
        requestId: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
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
//# sourceMappingURL=validation.d.ts.map