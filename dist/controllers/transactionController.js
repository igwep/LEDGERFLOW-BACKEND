"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionController = exports.TransactionController = void 0;
const transactionService_1 = require("../services/transactionService");
const fraudScoringService_1 = require("../services/fraudScoringService");
class TransactionController {
    async initializeTransaction(req, res) {
        try {
            const { userId, amount, currency, type, description, metadata, idempotencyKey, provider, expiresAt } = req.body;
            // Initialize transaction
            const result = await transactionService_1.transactionService.initializeTransaction(userId, amount, currency, type, {
                description,
                metadata,
                idempotencyKey,
                provider,
                expiresAt: expiresAt ? new Date(expiresAt) : undefined,
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
            // Perform fraud analysis
            const fraudContext = {
                userId,
                amount,
                currency,
                type,
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                location: metadata?.location,
            };
            const fraudResult = await fraudScoringService_1.fraudScoringService.analyzeTransaction(fraudContext);
            if (fraudResult.success) {
                // Save fraud score
                await fraudScoringService_1.fraudScoringService.saveFraudScore(result.data.id, userId, // Will need to get walletId
                fraudResult.data, fraudContext);
                // If high risk, return with warning
                if (fraudResult.data.flagged) {
                    return res.status(201).json({
                        success: true,
                        data: {
                            ...result.data,
                            fraudWarning: {
                                score: fraudResult.data.score,
                                level: fraudResult.data.level,
                                reason: fraudResult.data.reason,
                            },
                        },
                        meta: {
                            timestamp: new Date().toISOString(),
                            requestId: req.requestId,
                        },
                    });
                }
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
            console.error('Error in initializeTransaction controller:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to initialize transaction',
                },
                meta: {
                    timestamp: new Date().toISOString(),
                    requestId: req.requestId,
                },
            });
        }
    }
    async processTransaction(req, res) {
        try {
            const { reference } = req.params;
            const referenceString = Array.isArray(reference) ? reference[0] : reference;
            const { providerRef, metadata } = req.body;
            const result = await transactionService_1.transactionService.processTransaction(referenceString, {
                providerRef,
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
            console.error('Error in processTransaction controller:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to process transaction',
                },
                meta: {
                    timestamp: new Date().toISOString(),
                    requestId: req.requestId,
                },
            });
        }
    }
    async getTransaction(req, res) {
        try {
            const { reference } = req.params;
            const referenceString = Array.isArray(reference) ? reference[0] : reference;
            const result = await transactionService_1.transactionService.getTransaction(referenceString);
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
            console.error('Error in getTransaction controller:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to fetch transaction',
                },
                meta: {
                    timestamp: new Date().toISOString(),
                    requestId: req.requestId,
                },
            });
        }
    }
    async listTransactions(req, res) {
        try {
            const { userId } = req.params;
            const { status, type, limit, offset, startDate, endDate } = req.query;
            const result = await transactionService_1.transactionService.listTransactions(String(userId), {
                status: status ? String(status) : undefined,
                type: type ? String(type) : undefined,
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
            console.error('Error in listTransactions controller:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to list transactions',
                },
                meta: {
                    timestamp: new Date().toISOString(),
                    requestId: req.requestId,
                },
            });
        }
    }
    async failTransaction(req, res) {
        try {
            const { reference } = req.params;
            const { reason } = req.body;
            const referenceString = Array.isArray(reference) ? reference[0] : reference;
            const result = await transactionService_1.transactionService.failTransaction(referenceString, reason);
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
            console.error('Error in failTransaction controller:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to fail transaction',
                },
                meta: {
                    timestamp: new Date().toISOString(),
                    requestId: req.requestId,
                },
            });
        }
    }
    async reverseTransaction(req, res) {
        try {
            const { reference } = req.params;
            const { reason } = req.body;
            const referenceString = Array.isArray(reference) ? reference[0] : reference;
            const result = await transactionService_1.transactionService.reverseTransaction(referenceString, reason);
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
            console.error('Error in reverseTransaction controller:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to reverse transaction',
                },
                meta: {
                    timestamp: new Date().toISOString(),
                    requestId: req.requestId,
                },
            });
        }
    }
    async getTransactionFraudScore(req, res) {
        try {
            const { reference } = req.params;
            const referenceString = Array.isArray(reference) ? reference[0] : reference;
            // Get transaction first
            const transactionResult = await transactionService_1.transactionService.getTransaction(referenceString);
            if (!transactionResult.success) {
                return res.status(404).json({
                    success: false,
                    error: transactionResult.error,
                    meta: {
                        timestamp: new Date().toISOString(),
                        requestId: req.requestId,
                    },
                });
            }
            const result = await fraudScoringService_1.fraudScoringService.getFraudScore(transactionResult.data.id);
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
            console.error('Error in getTransactionFraudScore controller:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to fetch fraud score',
                },
                meta: {
                    timestamp: new Date().toISOString(),
                    requestId: req.requestId,
                },
            });
        }
    }
}
exports.TransactionController = TransactionController;
exports.transactionController = new TransactionController();
//# sourceMappingURL=transactionController.js.map