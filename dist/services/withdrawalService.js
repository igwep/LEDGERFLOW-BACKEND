"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withdrawalService = exports.WithdrawalService = void 0;
// Import PrismaClient dynamically
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const types_1 = require("../types");
const walletService_1 = require("./walletService");
const transactionService_1 = require("./transactionService");
class WithdrawalService {
    async createWithdrawal(userId, amount, bankName, accountNumber, accountName, options = {}) {
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
                        throw new types_1.ConflictError('Idempotency key conflict');
                    }
                }
                // Get wallet
                const wallet = await tx.wallet.findUnique({
                    where: { userId },
                });
                if (!wallet) {
                    throw new types_1.NotFoundError('Wallet');
                }
                const availableBalance = Number(wallet.available);
                if (availableBalance < amount) {
                    throw new types_1.InsufficientFundsError('Insufficient available balance for withdrawal');
                }
                // Lock funds for withdrawal
                const lockResult = await walletService_1.walletService.lockFunds(wallet.id, amount, `Funds locked for withdrawal to ${bankName} - ${accountNumber}`);
                if (!lockResult.success) {
                    throw new Error(lockResult.error?.message || 'Failed to lock funds');
                }
                // Create withdrawal record
                const withdrawal = await tx.withdrawal.create({
                    data: {
                        userId,
                        amount,
                        status: 'PENDING',
                        bankName,
                        accountNumber,
                        transferRef: this.generateTransferReference(),
                    },
                });
                // Cache idempotency response if key provided
                if (options.idempotencyKey) {
                    await tx.idempotencyKey.update({
                        where: { key: options.idempotencyKey },
                        data: {
                            response: this.mapWithdrawalToData(withdrawal),
                            statusCode: 201,
                        },
                    });
                }
                return {
                    success: true,
                    data: this.mapWithdrawalToData(withdrawal),
                };
            }
            catch (error) {
                console.error('Error creating withdrawal:', error);
                throw error;
            }
        });
    }
    async processWithdrawal(withdrawalId, status, options = {}) {
        return await prisma.$transaction(async (tx) => {
            try {
                // Get withdrawal
                const withdrawal = await tx.withdrawal.findUnique({
                    where: { id: withdrawalId },
                    include: { user: true },
                });
                if (!withdrawal) {
                    throw new types_1.NotFoundError('Withdrawal');
                }
                if (withdrawal.status === 'SUCCESS' || withdrawal.status === 'FAILED') {
                    throw new types_1.ConflictError('Withdrawal already processed');
                }
                // Get wallet
                const wallet = await tx.wallet.findUnique({
                    where: { userId: withdrawal.userId },
                });
                if (!wallet) {
                    throw new types_1.NotFoundError('Wallet');
                }
                // Update withdrawal status
                const updatedWithdrawal = await tx.withdrawal.update({
                    where: { id: withdrawalId },
                    data: {
                        status,
                        transferRef: options.transferRef || withdrawal.transferRef,
                    },
                });
                // If withdrawal is successful, complete the transaction
                if (status === 'SUCCESS') {
                    // Create a transaction record for the withdrawal
                    const transactionResult = await transactionService_1.transactionService.initializeTransaction(withdrawal.userId, Number(withdrawal.amount), 'NGN', // Default currency, should be configurable
                    'DEBIT', {
                        description: `Withdrawal to ${withdrawal.bankName} - ${withdrawal.accountNumber}`,
                        metadata: {
                            withdrawalId: withdrawal.id,
                            bankName: withdrawal.bankName,
                            accountNumber: withdrawal.accountNumber,
                            transferRef: updatedWithdrawal.transferRef,
                            ...options.metadata,
                        },
                    });
                    if (!transactionResult.success) {
                        throw new Error(transactionResult.error?.message || 'Failed to create withdrawal transaction');
                    }
                    // Process the transaction
                    const processResult = await transactionService_1.transactionService.processTransaction(transactionResult.data.reference, {
                        providerRef: updatedWithdrawal.transferRef ?? undefined,
                        metadata: options.metadata,
                    });
                    if (!processResult.success) {
                        throw new Error(processResult.error?.message || 'Failed to process withdrawal transaction');
                    }
                    // Unlock funds (deduct from locked balance)
                    const lockedBalance = Number(wallet.lockedBalance);
                    const newLockedBalance = lockedBalance - Number(withdrawal.amount);
                    await tx.wallet.update({
                        where: {
                            id: wallet.id,
                            version: wallet.version,
                        },
                        data: {
                            lockedBalance: newLockedBalance,
                            version: wallet.version + 1,
                        },
                    });
                }
                else if (status === 'FAILED') {
                    // If withdrawal failed, unlock the funds back to available balance
                    const unlockResult = await walletService_1.walletService.unlockFunds(wallet.id, Number(withdrawal.amount), `Withdrawal failed - funds unlocked: ${options.transferRef || withdrawal.transferRef}`);
                    if (!unlockResult.success) {
                        throw new Error(unlockResult.error?.message || 'Failed to unlock funds');
                    }
                }
                return {
                    success: true,
                    data: this.mapWithdrawalToData(updatedWithdrawal),
                };
            }
            catch (error) {
                console.error('Error processing withdrawal:', error);
                throw error;
            }
        });
    }
    async getWithdrawal(withdrawalId) {
        try {
            const withdrawal = await prisma.withdrawal.findUnique({
                where: { id: withdrawalId },
                include: { user: true },
            });
            if (!withdrawal) {
                throw new types_1.NotFoundError('Withdrawal');
            }
            return {
                success: true,
                data: this.mapWithdrawalToData(withdrawal),
            };
        }
        catch (error) {
            console.error('Error fetching withdrawal:', error);
            return {
                success: false,
                error: {
                    code: 'WITHDRAWAL_FETCH_FAILED',
                    message: 'Failed to fetch withdrawal',
                    details: error,
                },
            };
        }
    }
    async listWithdrawals(userId, options = {}) {
        try {
            const { limit = 20, offset = 0, status, startDate, endDate } = options;
            const where = { userId };
            if (status)
                where.status = status;
            if (startDate || endDate) {
                where.createdAt = {};
                if (startDate)
                    where.createdAt.gte = startDate;
                if (endDate)
                    where.createdAt.lte = endDate;
            }
            const [withdrawals, total] = await Promise.all([
                prisma.withdrawal.findMany({
                    where,
                    orderBy: { createdAt: 'desc' },
                    take: limit,
                    skip: offset,
                    include: { user: true },
                }),
                prisma.withdrawal.count({ where }),
            ]);
            return {
                success: true,
                data: {
                    withdrawals: withdrawals.map(this.mapWithdrawalToData),
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
            console.error('Error listing withdrawals:', error);
            return {
                success: false,
                error: {
                    code: 'WITHDRAWALS_FETCH_FAILED',
                    message: 'Failed to fetch withdrawals',
                    details: error,
                },
            };
        }
    }
    async cancelWithdrawal(withdrawalId, reason) {
        return await prisma.$transaction(async (tx) => {
            try {
                const withdrawal = await tx.withdrawal.findUnique({
                    where: { id: withdrawalId },
                });
                if (!withdrawal) {
                    throw new types_1.NotFoundError('Withdrawal');
                }
                if (withdrawal.status !== 'PENDING') {
                    throw new types_1.ConflictError('Only pending withdrawals can be cancelled');
                }
                // Get wallet
                const wallet = await tx.wallet.findUnique({
                    where: { userId: withdrawal.userId },
                });
                if (!wallet) {
                    throw new types_1.NotFoundError('Wallet');
                }
                // Unlock the funds back to available balance
                const unlockResult = await walletService_1.walletService.unlockFunds(wallet.id, Number(withdrawal.amount), `Withdrawal cancelled - funds unlocked: ${reason || 'User request'}`);
                if (!unlockResult.success) {
                    throw new Error(unlockResult.error?.message || 'Failed to unlock funds');
                }
                // Mark withdrawal as failed
                const updatedWithdrawal = await tx.withdrawal.update({
                    where: { id: withdrawalId },
                    data: {
                        status: 'FAILED',
                    },
                });
                return {
                    success: true,
                    data: this.mapWithdrawalToData(updatedWithdrawal),
                };
            }
            catch (error) {
                console.error('Error cancelling withdrawal:', error);
                throw error;
            }
        });
    }
    async getWithdrawalStats(userId, options = {}) {
        try {
            const { startDate, endDate } = options;
            const where = { userId };
            if (startDate || endDate) {
                where.createdAt = {};
                if (startDate)
                    where.createdAt.gte = startDate;
                if (endDate)
                    where.createdAt.lte = endDate;
            }
            const [totalWithdrawals, totalAmountResult, statusCounts,] = await Promise.all([
                prisma.withdrawal.count({ where }),
                prisma.withdrawal.aggregate({
                    where,
                    _sum: { amount: true },
                }),
                prisma.withdrawal.groupBy({
                    by: ['status'],
                    where,
                    _count: { status: true },
                }),
            ]);
            const statusMap = statusCounts.reduce((acc, item) => {
                acc[item.status] = item._count.status;
                return acc;
            }, {});
            return {
                success: true,
                data: {
                    totalWithdrawals,
                    totalAmount: Number(totalAmountResult._sum.amount || 0),
                    pendingWithdrawals: statusMap['PENDING'] || 0,
                    processingWithdrawals: statusMap['PROCESSING'] || 0,
                    completedWithdrawals: statusMap['SUCCESS'] || 0,
                    failedWithdrawals: statusMap['FAILED'] || 0,
                },
            };
        }
        catch (error) {
            console.error('Error fetching withdrawal stats:', error);
            return {
                success: false,
                error: {
                    code: 'WITHDRAWAL_STATS_FAILED',
                    message: 'Failed to fetch withdrawal statistics',
                    details: error,
                },
            };
        }
    }
    generateTransferReference() {
        const timestamp = Date.now().toString();
        const random = Math.random().toString(36).substring(2, 8);
        return `TXF_${timestamp}_${random}`.toUpperCase();
    }
    mapWithdrawalToData(withdrawal) {
        return {
            id: withdrawal.id,
            userId: withdrawal.userId,
            amount: Number(withdrawal.amount),
            status: withdrawal.status,
            bankName: withdrawal.bankName,
            accountNumber: withdrawal.accountNumber,
            transferRef: withdrawal.transferRef,
            createdAt: withdrawal.createdAt,
            updatedAt: withdrawal.updatedAt,
        };
    }
}
exports.WithdrawalService = WithdrawalService;
exports.withdrawalService = new WithdrawalService();
//# sourceMappingURL=withdrawalService.js.map