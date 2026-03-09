"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.walletService = exports.WalletService = void 0;
// Import PrismaClient dynamically
const { PrismaClient } = require('@prisma/client');
const types_1 = require("../types");
const prisma = new PrismaClient();
class WalletService {
    async createWallet(userId, currency = 'NGN') {
        try {
            // Check if wallet already exists
            const existingWallet = await prisma.wallet.findUnique({
                where: { userId },
            });
            if (existingWallet) {
                return {
                    success: false,
                    error: {
                        code: 'WALLET_ALREADY_EXISTS',
                        message: 'Wallet already exists for this user',
                    },
                };
            }
            const wallet = await prisma.wallet.create({
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
            return {
                success: true,
                data: this.mapWalletToData(wallet),
            };
        }
        catch (error) {
            console.error('Error creating wallet:', error);
            return {
                success: false,
                error: {
                    code: 'WALLET_CREATION_FAILED',
                    message: 'Failed to create wallet',
                    details: error,
                },
            };
        }
    }
    async getWallet(userId) {
        try {
            const wallet = await prisma.wallet.findUnique({
                where: { userId },
                include: {
                    ledgerEntries: {
                        orderBy: { createdAt: 'desc' },
                        take: 10,
                    },
                },
            });
            if (!wallet) {
                return {
                    success: false,
                    error: {
                        code: 'WALLET_NOT_FOUND',
                        message: 'Wallet not found',
                    },
                };
            }
            return {
                success: true,
                data: this.mapWalletToData(wallet),
            };
        }
        catch (error) {
            console.error('Error fetching wallet:', error);
            return {
                success: false,
                error: {
                    code: 'WALLET_FETCH_FAILED',
                    message: 'Failed to fetch wallet',
                    details: error,
                },
            };
        }
    }
    async processDoubleEntryTransaction(walletId, transactionId, amount, type, description, reference) {
        return await prisma.$transaction(async (tx) => {
            try {
                // Get wallet with optimistic locking
                const wallet = await tx.wallet.findUnique({
                    where: { id: walletId },
                });
                if (!wallet) {
                    throw new types_1.NotFoundError('Wallet');
                }
                if (wallet.status !== 'ACTIVE') {
                    throw new types_1.WalletLockedError('Wallet is not active');
                }
                const currentBalance = Number(wallet.balance);
                const currentAvailable = Number(wallet.available);
                const currentLockedBalance = Number(wallet.lockedBalance);
                let newBalance;
                let newAvailable;
                let newLockedBalance;
                if (type === 'DEBIT') {
                    if (currentAvailable < amount) {
                        throw new types_1.InsufficientFundsError('Insufficient available balance');
                    }
                    newBalance = currentBalance - amount;
                    newAvailable = currentAvailable - amount;
                    newLockedBalance = currentLockedBalance;
                }
                else {
                    newBalance = currentBalance + amount;
                    newAvailable = currentAvailable + amount;
                    newLockedBalance = currentLockedBalance;
                }
                // Update wallet balance with optimistic locking
                const updatedWallet = await tx.wallet.update({
                    where: {
                        id: walletId,
                        version: wallet.version,
                    },
                    data: {
                        balance: newBalance,
                        available: newAvailable,
                        lockedBalance: newLockedBalance,
                        version: wallet.version + 1,
                    },
                });
                // Create ledger entries for double-entry
                const ledgerEntries = await this.createLedgerEntries(tx, walletId, transactionId, amount, type, currentBalance, newBalance, description, reference);
                return {
                    success: true,
                    data: ledgerEntries,
                };
            }
            catch (error) {
                console.error('Error processing double-entry transaction:', error);
                throw error;
            }
        });
    }
    async lockFunds(walletId, amount, description) {
        return await prisma.$transaction(async (tx) => {
            try {
                const wallet = await tx.wallet.findUnique({
                    where: { id: walletId },
                });
                if (!wallet) {
                    throw new types_1.NotFoundError('Wallet');
                }
                const currentAvailable = Number(wallet.available);
                const currentLockedBalance = Number(wallet.lockedBalance);
                if (currentAvailable < amount) {
                    throw new types_1.InsufficientFundsError('Insufficient available balance to lock funds');
                }
                const updatedWallet = await tx.wallet.update({
                    where: {
                        id: walletId,
                        version: wallet.version,
                    },
                    data: {
                        available: currentAvailable - amount,
                        lockedBalance: currentLockedBalance + amount,
                        version: wallet.version + 1,
                    },
                });
                // Create ledger entry for fund locking
                await tx.ledgerEntry.create({
                    data: {
                        walletId,
                        transactionId: '', // Will be updated when transaction is created
                        type: 'DEBIT',
                        amount,
                        balanceBefore: currentAvailable,
                        balanceAfter: currentAvailable - amount,
                        description: description || 'Funds locked',
                        reference: 'LOCK',
                    },
                });
                return {
                    success: true,
                    data: this.mapWalletToData(updatedWallet),
                };
            }
            catch (error) {
                console.error('Error locking funds:', error);
                throw error;
            }
        });
    }
    async unlockFunds(walletId, amount, description) {
        return await prisma.$transaction(async (tx) => {
            try {
                const wallet = await tx.wallet.findUnique({
                    where: { id: walletId },
                });
                if (!wallet) {
                    throw new types_1.NotFoundError('Wallet');
                }
                const currentAvailable = Number(wallet.available);
                const currentLockedBalance = Number(wallet.lockedBalance);
                if (currentLockedBalance < amount) {
                    throw new types_1.InsufficientFundsError('Insufficient locked balance to unlock');
                }
                const updatedWallet = await tx.wallet.update({
                    where: {
                        id: walletId,
                        version: wallet.version,
                    },
                    data: {
                        available: currentAvailable + amount,
                        lockedBalance: currentLockedBalance - amount,
                        version: wallet.version + 1,
                    },
                });
                // Create ledger entry for fund unlocking
                await tx.ledgerEntry.create({
                    data: {
                        walletId,
                        transactionId: '', // Will be updated when transaction is created
                        type: 'CREDIT',
                        amount,
                        balanceBefore: currentAvailable,
                        balanceAfter: currentAvailable + amount,
                        description: description || 'Funds unlocked',
                        reference: 'UNLOCK',
                    },
                });
                return {
                    success: true,
                    data: this.mapWalletToData(updatedWallet),
                };
            }
            catch (error) {
                console.error('Error unlocking funds:', error);
                throw error;
            }
        });
    }
    async getLedgerEntries(walletId, options = {}) {
        try {
            const { limit = 20, offset = 0, type, startDate, endDate } = options;
            const where = { walletId };
            if (type) {
                where.type = type;
            }
            if (startDate || endDate) {
                where.createdAt = {};
                if (startDate)
                    where.createdAt.gte = startDate;
                if (endDate)
                    where.createdAt.lte = endDate;
            }
            const [entries, total] = await Promise.all([
                prisma.ledgerEntry.findMany({
                    where,
                    orderBy: { createdAt: 'desc' },
                    take: limit,
                    skip: offset,
                }),
                prisma.ledgerEntry.count({ where }),
            ]);
            return {
                success: true,
                data: {
                    entries: entries.map(this.mapLedgerEntryToData),
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
            console.error('Error fetching ledger entries:', error);
            return {
                success: false,
                error: {
                    code: 'LEDGER_FETCH_FAILED',
                    message: 'Failed to fetch ledger entries',
                    details: error,
                },
            };
        }
    }
    async createLedgerEntries(tx, walletId, transactionId, amount, type, balanceBefore, balanceAfter, description, reference) {
        // Create the main ledger entry
        const mainEntry = await tx.ledgerEntry.create({
            data: {
                walletId,
                transactionId,
                type,
                amount,
                balanceBefore,
                balanceAfter,
                description,
                reference,
            },
        });
        // For double-entry, create a corresponding entry
        // In a real system, this might be a system wallet or fee account
        const systemEntry = await tx.ledgerEntry.create({
            data: {
                walletId,
                transactionId,
                type: type === 'CREDIT' ? 'DEBIT' : 'CREDIT',
                amount,
                balanceBefore,
                balanceAfter,
                description: `Corresponding ${type === 'CREDIT' ? 'DEBIT' : 'CREDIT'} entry`,
                reference: `CORRESPONDING_${reference || 'SYSTEM'}`,
            },
        });
        return [mainEntry, systemEntry].map(this.mapLedgerEntryToData);
    }
    mapWalletToData(wallet) {
        return {
            id: wallet.id,
            userId: wallet.userId,
            balance: Number(wallet.balance),
            available: Number(wallet.available),
            lockedBalance: Number(wallet.lockedBalance),
            currency: wallet.currency,
            status: wallet.status,
            version: wallet.version,
            createdAt: wallet.createdAt,
            updatedAt: wallet.updatedAt,
        };
    }
    mapLedgerEntryToData(entry) {
        return {
            id: entry.id,
            walletId: entry.walletId,
            transactionId: entry.transactionId,
            type: entry.type,
            amount: Number(entry.amount),
            balanceBefore: Number(entry.balanceBefore),
            balanceAfter: Number(entry.balanceAfter),
            description: entry.description,
            reference: entry.reference,
            createdAt: entry.createdAt,
        };
    }
}
exports.WalletService = WalletService;
exports.walletService = new WalletService();
//# sourceMappingURL=walletService.js.map