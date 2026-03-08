"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.walletController = exports.WalletController = void 0;
const walletService_1 = require("../services/walletService");
class WalletController {
    async createWallet(req, res) {
        try {
            const { userId, currency } = req.body;
            const result = await walletService_1.walletService.createWallet(userId, currency);
            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    error: result.error,
                    meta: {
                        timestamp: new Date().toISOString(),
                        requestId: req.requestId,
                    },
                });
            }
            res.status(201).json({
                success: true,
                data: result.data,
                meta: {
                    timestamp: new Date().toISOString(),
                    requestId: req.requestId,
                },
            });
        }
        catch (error) {
            console.error('Error in createWallet controller:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to create wallet',
                },
                meta: {
                    timestamp: new Date().toISOString(),
                    requestId: req.requestId,
                },
            });
        }
    }
    async getWallet(req, res) {
        try {
            const { userId } = req.params;
            const userIdString = Array.isArray(userId) ? userId[0] : userId;
            const result = await walletService_1.walletService.getWallet(userIdString);
            if (!result.success) {
                return res.status(404).json({
                    success: false,
                    error: result.error,
                    meta: {
                        timestamp: new Date().toISOString(),
                        requestId: req.requestId,
                    },
                });
            }
            res.json({
                success: true,
                data: result.data,
                meta: {
                    timestamp: new Date().toISOString(),
                    requestId: req.requestId,
                },
            });
        }
        catch (error) {
            console.error('Error in getWallet controller:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to fetch wallet',
                },
                meta: {
                    timestamp: new Date().toISOString(),
                    requestId: req.requestId,
                },
            });
        }
    }
    async getLedgerEntries(req, res) {
        try {
            const { userId } = req.params;
            const userIdString = Array.isArray(userId) ? userId[0] : userId;
            const { limit, offset, type, startDate, endDate } = req.query;
            // Get wallet first
            const walletResult = await walletService_1.walletService.getWallet(userIdString);
            if (!walletResult.success) {
                return res.status(404).json({
                    success: false,
                    error: walletResult.error,
                    meta: {
                        timestamp: new Date().toISOString(),
                        requestId: req.requestId,
                    },
                });
            }
            const result = await walletService_1.walletService.getLedgerEntries(walletResult.data.id, {
                limit: limit ? parseInt(String(limit)) : undefined,
                offset: offset ? parseInt(String(offset)) : undefined,
                type: type ? String(type) : undefined,
                startDate: startDate ? new Date(String(startDate)) : undefined,
                endDate: endDate ? new Date(String(endDate)) : undefined,
            });
            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    error: result.error,
                    meta: {
                        timestamp: new Date().toISOString(),
                        requestId: req.requestId,
                    },
                });
            }
            res.json({
                success: true,
                data: result.data,
                meta: {
                    timestamp: new Date().toISOString(),
                    requestId: req.requestId,
                    pagination: result.meta?.pagination,
                },
            });
        }
        catch (error) {
            console.error('Error in getLedgerEntries controller:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to fetch ledger entries',
                },
                meta: {
                    timestamp: new Date().toISOString(),
                    requestId: req.requestId,
                },
            });
        }
    }
    async lockFunds(req, res) {
        try {
            const { userId } = req.params;
            const userIdString = Array.isArray(userId) ? userId[0] : userId;
            const { amount, description } = req.body;
            // Get wallet first
            const walletResult = await walletService_1.walletService.getWallet(userIdString);
            if (!walletResult.success) {
                return res.status(404).json({
                    success: false,
                    error: walletResult.error,
                    meta: {
                        timestamp: new Date().toISOString(),
                        requestId: req.requestId,
                    },
                });
            }
            const result = await walletService_1.walletService.lockFunds(walletResult.data.id, amount, description);
            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    error: result.error,
                    meta: {
                        timestamp: new Date().toISOString(),
                        requestId: req.requestId,
                    },
                });
            }
            res.json({
                success: true,
                data: result.data,
                meta: {
                    timestamp: new Date().toISOString(),
                    requestId: req.requestId,
                },
            });
        }
        catch (error) {
            console.error('Error in lockFunds controller:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to lock funds',
                },
                meta: {
                    timestamp: new Date().toISOString(),
                    requestId: req.requestId,
                },
            });
        }
    }
    async unlockFunds(req, res) {
        try {
            const { userId } = req.params;
            const userIdString = Array.isArray(userId) ? userId[0] : userId;
            const { amount, description } = req.body;
            // Get wallet first
            const walletResult = await walletService_1.walletService.getWallet(userIdString);
            if (!walletResult.success) {
                return res.status(404).json({
                    success: false,
                    error: walletResult.error,
                    meta: {
                        timestamp: new Date().toISOString(),
                        requestId: req.requestId,
                    },
                });
            }
            const result = await walletService_1.walletService.unlockFunds(walletResult.data.id, amount, description);
            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    error: result.error,
                    meta: {
                        timestamp: new Date().toISOString(),
                        requestId: req.requestId,
                    },
                });
            }
            res.json({
                success: true,
                data: result.data,
                meta: {
                    timestamp: new Date().toISOString(),
                    requestId: req.requestId,
                },
            });
        }
        catch (error) {
            console.error('Error in unlockFunds controller:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to unlock funds',
                },
                meta: {
                    timestamp: new Date().toISOString(),
                    requestId: req.requestId,
                },
            });
        }
    }
    async getWalletBalance(req, res) {
        try {
            const { userId } = req.params;
            const userIdString = Array.isArray(userId) ? userId[0] : userId;
            const result = await walletService_1.walletService.getWallet(userIdString);
            if (!result.success) {
                return res.status(404).json({
                    success: false,
                    error: result.error,
                    meta: {
                        timestamp: new Date().toISOString(),
                        requestId: req.requestId,
                    },
                });
            }
            // Return only balance information
            const balanceInfo = {
                balance: result.data.balance,
                available: result.data.available,
                lockedBalance: result.data.lockedBalance,
                currency: result.data.currency,
            };
            res.json({
                success: true,
                data: balanceInfo,
                meta: {
                    timestamp: new Date().toISOString(),
                    requestId: req.requestId,
                },
            });
        }
        catch (error) {
            console.error('Error in getWalletBalance controller:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to fetch wallet balance',
                },
                meta: {
                    timestamp: new Date().toISOString(),
                    requestId: req.requestId,
                },
            });
        }
    }
}
exports.WalletController = WalletController;
exports.walletController = new WalletController();
//# sourceMappingURL=walletController.js.map