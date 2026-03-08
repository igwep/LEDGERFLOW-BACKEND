"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withdrawalController = exports.WithdrawalController = void 0;
const withdrawalService_1 = require("../services/withdrawalService");
class WithdrawalController {
    async createWithdrawal(req, res) {
        try {
            const { userId, amount, bankName, accountNumber, accountName, description, idempotencyKey } = req.body;
            const result = await withdrawalService_1.withdrawalService.createWithdrawal(userId, amount, bankName, accountNumber, accountName, {
                description,
                idempotencyKey,
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
            console.error('Error in createWithdrawal controller:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to create withdrawal',
                },
                meta: {
                    timestamp: new Date().toISOString(),
                    requestId: req.requestId,
                },
            });
        }
    }
    async processWithdrawal(req, res) {
        try {
            const { withdrawalId } = req.params;
            const withdrawalIdString = Array.isArray(withdrawalId) ? withdrawalId[0] : withdrawalId;
            const { status, transferRef, metadata } = req.body;
            const result = await withdrawalService_1.withdrawalService.processWithdrawal(withdrawalIdString, status, {
                transferRef,
                metadata,
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
                },
            });
        }
        catch (error) {
            console.error('Error in processWithdrawal controller:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to process withdrawal',
                },
                meta: {
                    timestamp: new Date().toISOString(),
                    requestId: req.requestId,
                },
            });
        }
    }
    async getWithdrawal(req, res) {
        try {
            const { withdrawalId } = req.params;
            const withdrawalIdString = Array.isArray(withdrawalId) ? withdrawalId[0] : withdrawalId;
            const result = await withdrawalService_1.withdrawalService.getWithdrawal(withdrawalIdString);
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
            console.error('Error in getWithdrawal controller:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to fetch withdrawal',
                },
                meta: {
                    timestamp: new Date().toISOString(),
                    requestId: req.requestId,
                },
            });
        }
    }
    async listWithdrawals(req, res) {
        try {
            const { userId } = req.params;
            const { status, limit, offset, startDate, endDate } = req.query;
            const result = await withdrawalService_1.withdrawalService.listWithdrawals(String(userId), {
                status: status ? String(status) : undefined,
                limit: limit ? parseInt(String(limit)) : undefined,
                offset: offset ? parseInt(String(offset)) : undefined,
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
            console.error('Error in listWithdrawals controller:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to list withdrawals',
                },
                meta: {
                    timestamp: new Date().toISOString(),
                    requestId: req.requestId,
                },
            });
        }
    }
    async cancelWithdrawal(req, res) {
        try {
            const { withdrawalId } = req.params;
            const withdrawalIdString = Array.isArray(withdrawalId) ? withdrawalId[0] : withdrawalId;
            const { reason } = req.body;
            const result = await withdrawalService_1.withdrawalService.cancelWithdrawal(withdrawalIdString, reason);
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
            console.error('Error in cancelWithdrawal controller:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to cancel withdrawal',
                },
                meta: {
                    timestamp: new Date().toISOString(),
                    requestId: req.requestId,
                },
            });
        }
    }
    async getWithdrawalStats(req, res) {
        try {
            const { userId } = req.params;
            const { startDate, endDate } = req.query;
            const result = await withdrawalService_1.withdrawalService.getWithdrawalStats(String(userId), {
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
                },
            });
        }
        catch (error) {
            console.error('Error in getWithdrawalStats controller:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to fetch withdrawal statistics',
                },
                meta: {
                    timestamp: new Date().toISOString(),
                    requestId: req.requestId,
                },
            });
        }
    }
}
exports.WithdrawalController = WithdrawalController;
exports.withdrawalController = new WithdrawalController();
//# sourceMappingURL=withdrawalController.js.map