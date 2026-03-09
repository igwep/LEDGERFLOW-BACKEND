"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionService = exports.TransactionService = void 0;
const types_1 = require("../types");
const walletService_1 = require("./walletService");
// Import PrismaClient dynamically
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
class TransactionService {
    async initializeTransaction(userId, amount, currency, type, options = {}) {
        return await prisma.$transaction(async (tx) => {
            try {
                // Check idempotency
                if (options.idempotencyKey) {
                    const existingKey = await tx.idempotencyKey.findUnique({
                        where: { key: options.idempotencyKey },
                    });
                    if (existingKey) {
                        if (existingKey.response && existingKey.statusCode) {
                            return {
                                success: true,
                                data: existingKey.response,
                            };
                        }
                        throw new types_1.IdempotencyError('Idempotency key conflict');
                    }
                }
                // Get or create wallet
                let wallet = await tx.wallet.findUnique({
                    where: { userId },
                });
                if (!wallet) {
                    wallet = await tx.wallet.create({
                        data: {
                            userId,
                            currency,
                            balance: 0,
                            available: 0,
                            lockedBalance: 0,
                            status: 'ACTIVE',
                            version: 0,
                        },
                    });
                }
                // Generate unique reference
                const reference = this.generateTransactionReference();
                // Create transaction
                const transaction = await tx.transaction.create({
                    data: {
                        reference,
                        userId,
                        amount,
                        currency,
                        type,
                        status: 'PENDING',
                        description: options.description,
                        metadata: this.serializeMetadata(options.metadata),
                        idempotencyKey: options.idempotencyKey,
                        provider: options.provider,
                        expiresAt: options.expiresAt || new Date(Date.now() + 30 * 60 * 1000), // 30 minutes default
                    },
                });
                // Cache idempotency response if key provided
                if (options.idempotencyKey) {
                    await tx.idempotencyKey.update({
                        where: { key: options.idempotencyKey },
                        data: {
                            transactionId: transaction.id,
                            response: JSON.parse(JSON.stringify(this.mapTransactionToData(transaction))),
                            statusCode: 201,
                        },
                    });
                }
                return {
                    success: true,
                    data: this.mapTransactionToData(transaction),
                };
            }
            catch (error) {
                console.error('Error initializing transaction:', error);
                throw error;
            }
        });
    }
    async processTransaction(reference, options = {}) {
        return await prisma.$transaction(async (tx) => {
            try {
                // Get transaction
                const transaction = await tx.transaction.findUnique({
                    where: { reference },
                });
                if (!transaction) {
                    throw new types_1.NotFoundError('Transaction');
                }
                if (transaction.status !== 'PENDING') {
                    throw new types_1.ConflictError('Transaction is not in PENDING status');
                }
                if (transaction.expiresAt && transaction.expiresAt < new Date()) {
                    await tx.transaction.update({
                        where: { id: transaction.id },
                        data: { status: 'FAILED' },
                    });
                    throw new types_1.ConflictError('Transaction has expired');
                }
                // Get wallet
                const wallet = await tx.wallet.findUnique({
                    where: { userId: transaction.userId },
                });
                if (!wallet) {
                    throw new types_1.NotFoundError('Wallet');
                }
                // Process the transaction using wallet service
                const ledgerResult = await walletService_1.walletService.processDoubleEntryTransaction(wallet.id, transaction.id, Number(transaction.amount), transaction.type, transaction.description || undefined, transaction.providerRef || reference);
                if (!ledgerResult.success) {
                    throw new Error(ledgerResult.error?.message || 'Failed to process ledger entries');
                }
                // Update transaction status
                const updatedTransaction = await tx.transaction.update({
                    where: { id: transaction.id },
                    data: {
                        status: 'SUCCESS',
                        providerRef: options.providerRef,
                        metadata: options.metadata ? this.serializeMetadata(options.metadata) : (transaction.metadata ? this.serializeMetadata(transaction.metadata && typeof transaction.metadata === 'object' ? transaction.metadata : {}) : undefined),
                        processedAt: new Date(),
                    },
                });
                return {
                    success: true,
                    data: this.mapTransactionToData(updatedTransaction),
                };
            }
            catch (error) {
                console.error('Error processing transaction:', error);
                // Mark transaction as failed if it exists
                try {
                    const transaction = await tx.transaction.findUnique({
                        where: { reference },
                    });
                    if (transaction && transaction.status === 'PENDING') {
                        await tx.transaction.update({
                            where: { id: transaction.id },
                            data: {
                                status: 'FAILED',
                                metadata: this.serializeMetadata({
                                    ...(transaction.metadata && typeof transaction.metadata === 'object' ? transaction.metadata : {}),
                                    error: error instanceof Error ? error.message : 'Unknown error',
                                }),
                            },
                        });
                    }
                }
                catch (updateError) {
                    console.error('Error marking transaction as failed:', updateError);
                }
                throw error;
            }
        });
    }
    async failTransaction(reference, reason) {
        try {
            const transaction = await prisma.transaction.findUnique({
                where: { reference },
            });
            if (!transaction) {
                throw new types_1.NotFoundError('Transaction');
            }
            if (transaction.status !== 'PENDING') {
                throw new types_1.ConflictError('Transaction is not in PENDING status');
            }
            const updatedTransaction = await prisma.transaction.update({
                where: { id: transaction.id },
                data: {
                    status: 'FAILED',
                    metadata: this.serializeMetadata({
                        ...(transaction.metadata && typeof transaction.metadata === 'object' ? transaction.metadata : {}),
                        failureReason: reason || 'Transaction failed',
                    }),
                },
            });
            return {
                success: true,
                data: this.mapTransactionToData(updatedTransaction),
            };
        }
        catch (error) {
            console.error('Error failing transaction:', error);
            return {
                success: false,
                error: {
                    code: 'TRANSACTION_FAILED',
                    message: 'Failed to mark transaction as failed',
                    details: error,
                },
            };
        }
    }
    async getTransaction(reference) {
        try {
            const transaction = await prisma.transaction.findUnique({
                where: { reference },
                include: {
                    ledgerEntries: true,
                    fraudScore: true,
                },
            });
            if (!transaction) {
                throw new types_1.NotFoundError('Transaction');
            }
            return {
                success: true,
                data: this.mapTransactionToData(transaction),
            };
        }
        catch (error) {
            console.error('Error fetching transaction:', error);
            return {
                success: false,
                error: {
                    code: 'TRANSACTION_FETCH_FAILED',
                    message: 'Failed to fetch transaction',
                    details: error,
                },
            };
        }
    }
    async listTransactions(userId, options = {}) {
        try {
            const { limit = 20, offset = 0, status, type, startDate, endDate } = options;
            const where = { userId };
            if (status)
                where.status = status;
            if (type)
                where.type = type;
            if (startDate || endDate) {
                where.createdAt = {};
                if (startDate)
                    where.createdAt.gte = startDate;
                if (endDate)
                    where.createdAt.lte = endDate;
            }
            const [transactions, total] = await Promise.all([
                prisma.transaction.findMany({
                    where,
                    orderBy: { createdAt: 'desc' },
                    take: limit,
                    skip: offset,
                    include: {
                        ledgerEntries: true,
                        fraudScore: true,
                    },
                }),
                prisma.transaction.count({ where }),
            ]);
            return {
                success: true,
                data: {
                    transactions: transactions.map(this.mapTransactionToData),
                    total,
                },
                meta: {
                    pagination: {
                        limit,
                        offset,
                        total,
                        hasMore: offset + limit < total,
                    },
                },
            };
        }
        catch (error) {
            console.error('Error listing transactions:', error);
            return {
                success: false,
                error: {
                    code: 'TRANSACTIONS_FETCH_FAILED',
                    message: 'Failed to fetch transactions',
                    details: error,
                },
            };
        }
    }
    async reverseTransaction(reference, reason) {
        return await prisma.$transaction(async (tx) => {
            try {
                const transaction = await tx.transaction.findUnique({
                    where: { reference },
                });
                if (!transaction) {
                    throw new types_1.NotFoundError('Transaction');
                }
                if (transaction.status !== 'SUCCESS') {
                    throw new types_1.ConflictError('Only successful transactions can be reversed');
                }
                // Get wallet
                const wallet = await tx.wallet.findUnique({
                    where: { userId: transaction.userId },
                });
                if (!wallet) {
                    throw new types_1.NotFoundError('Wallet');
                }
                // Create reverse transaction
                const reverseReference = this.generateTransactionReference();
                const reverseType = transaction.type === 'CREDIT' ? 'DEBIT' : 'CREDIT';
                const reverseTransaction = await tx.transaction.create({
                    data: {
                        reference: reverseReference,
                        userId: transaction.userId,
                        amount: transaction.amount,
                        currency: transaction.currency,
                        type: reverseType,
                        status: 'PENDING',
                        description: `Reversal of transaction ${reference}`,
                        metadata: this.serializeMetadata({
                            originalTransaction: reference,
                            reversalReason: reason || 'Transaction reversal',
                        }),
                    },
                });
                // Process the reversal
                const ledgerResult = await walletService_1.walletService.processDoubleEntryTransaction(wallet.id, reverseTransaction.id, Number(transaction.amount), reverseType, `Reversal of transaction ${reference}`, reverseReference);
                if (!ledgerResult.success) {
                    throw new Error(ledgerResult.error?.message || 'Failed to process reversal');
                }
                // Mark original transaction as reversed
                await tx.transaction.update({
                    where: { id: transaction.id },
                    data: { status: 'REVERSED' },
                });
                // Mark reverse transaction as successful
                const updatedReverseTransaction = await tx.transaction.update({
                    where: { id: reverseTransaction.id },
                    data: {
                        status: 'SUCCESS',
                        processedAt: new Date(),
                    },
                });
                return {
                    success: true,
                    data: this.mapTransactionToData(updatedReverseTransaction),
                };
            }
            catch (error) {
                console.error('Error reversing transaction:', error);
                throw error;
            }
        });
    }
    async cleanupExpiredTransactions() {
        try {
            const result = await prisma.transaction.updateMany({
                where: {
                    status: 'PENDING',
                    expiresAt: {
                        lt: new Date(),
                    },
                },
                data: {
                    status: 'EXPIRED',
                },
            });
            console.log(`Cleaned up ${result.count} expired transactions`);
            return {
                success: true,
                data: { count: result.count },
            };
        }
        catch (error) {
            console.error('Error cleaning up expired transactions:', error);
            return {
                success: false,
                error: {
                    code: 'CLEANUP_FAILED',
                    message: 'Failed to cleanup expired transactions',
                    details: error,
                },
            };
        }
    }
    generateTransactionReference() {
        const timestamp = Date.now().toString();
        const random = Math.random().toString(36).substring(2, 8);
        return `TXN_${timestamp}_${random}`.toUpperCase();
    }
    serializeMetadata(metadata) {
        if (!metadata)
            return undefined;
        try {
            return JSON.stringify(metadata);
        }
        catch (error) {
            console.error('Error serializing metadata:', error);
            return undefined;
        }
    }
    mapTransactionToData(transaction) {
        let parsedMetadata;
        try {
            parsedMetadata = transaction.metadata ? JSON.parse(transaction.metadata) : undefined;
        }
        catch (error) {
            console.error('Error parsing metadata:', error);
            parsedMetadata = undefined;
        }
        return {
            id: transaction.id,
            reference: transaction.reference,
            userId: transaction.userId,
            amount: Number(transaction.amount),
            currency: transaction.currency,
            type: transaction.type,
            status: transaction.status,
            provider: transaction.provider,
            providerRef: transaction.providerRef,
            description: transaction.description,
            metadata: parsedMetadata,
            idempotencyKey: transaction.idempotencyKey,
            processedAt: transaction.processedAt,
            expiresAt: transaction.expiresAt,
            createdAt: transaction.createdAt,
            updatedAt: transaction.updatedAt,
        };
    }
}
exports.TransactionService = TransactionService;
exports.transactionService = new TransactionService();
//# sourceMappingURL=transactionService.js.map