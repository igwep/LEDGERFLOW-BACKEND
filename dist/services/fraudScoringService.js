"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fraudScoringService = exports.FraudScoringService = void 0;
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
class FraudScoringService {
    constructor() {
        this.RISK_THRESHOLDS = {
            LOW: 30,
            MEDIUM: 60,
            HIGH: 80,
        };
    }
    async analyzeTransaction(context) {
        try {
            const factors = await this.collectRiskFactors(context);
            const score = this.calculateRiskScore(factors);
            const level = this.determineRiskLevel(score);
            const flagged = score >= this.RISK_THRESHOLDS.HIGH;
            const result = {
                score,
                level,
                factors,
                flagged,
                reason: flagged ? 'High risk transaction detected' : undefined,
            };
            return {
                success: true,
                data: result,
            };
        }
        catch (error) {
            console.error('Error analyzing transaction for fraud:', error);
            return {
                success: false,
                error: {
                    code: 'FRAUD_ANALYSIS_FAILED',
                    message: 'Failed to analyze transaction for fraud',
                    details: error,
                },
            };
        }
    }
    async saveFraudScore(transactionId, walletId, result, context) {
        try {
            const fraudScore = await prisma.fraudScore.create({
                data: {
                    walletId,
                    transactionId,
                    score: result.score,
                    level: result.level,
                    flagged: result.flagged,
                    factors: result.factors,
                    ipAddress: context.ipAddress,
                    userAgent: context.userAgent,
                    deviceId: context.deviceId,
                    location: context.location,
                    reason: result.reason,
                },
            });
            return {
                success: true,
                data: this.mapFraudScoreToData(fraudScore),
            };
        }
        catch (error) {
            console.error('Error saving fraud score:', error);
            return {
                success: false,
                error: {
                    code: 'FRAUD_SCORE_SAVE_FAILED',
                    message: 'Failed to save fraud score',
                    details: error,
                },
            };
        }
    }
    async getFraudScore(transactionId) {
        try {
            const fraudScore = await prisma.fraudScore.findUnique({
                where: { transactionId },
                include: {
                    wallet: true,
                    transaction: true,
                },
            });
            if (!fraudScore) {
                return {
                    success: false,
                    error: {
                        code: 'FRAUD_SCORE_NOT_FOUND',
                        message: 'Fraud score not found for transaction',
                    },
                };
            }
            return {
                success: true,
                data: this.mapFraudScoreToData(fraudScore),
            };
        }
        catch (error) {
            console.error('Error fetching fraud score:', error);
            return {
                success: false,
                error: {
                    code: 'FRAUD_SCORE_FETCH_FAILED',
                    message: 'Failed to fetch fraud score',
                    details: error,
                },
            };
        }
    }
    async getUserFraudHistory(userId, options = {}) {
        try {
            const { limit = 20, offset = 0, startDate, endDate } = options;
            // Get wallet for user
            const wallet = await prisma.wallet.findUnique({
                where: { userId },
            });
            if (!wallet) {
                return {
                    success: false,
                    error: {
                        code: 'WALLET_NOT_FOUND',
                        message: 'Wallet not found for user',
                    },
                };
            }
            const where = { walletId: wallet.id };
            if (startDate || endDate) {
                where.createdAt = {};
                if (startDate)
                    where.createdAt.gte = startDate;
                if (endDate)
                    where.createdAt.lte = endDate;
            }
            const [fraudScores, total] = await Promise.all([
                prisma.fraudScore.findMany({
                    where,
                    orderBy: { createdAt: 'desc' },
                    take: limit,
                    skip: offset,
                    include: {
                        transaction: true,
                    },
                }),
                prisma.fraudScore.count({ where }),
            ]);
            return {
                success: true,
                data: {
                    fraudScores: fraudScores.map(this.mapFraudScoreToData),
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
            console.error('Error fetching user fraud history:', error);
            return {
                success: false,
                error: {
                    code: 'FRAUD_HISTORY_FETCH_FAILED',
                    message: 'Failed to fetch fraud history',
                    details: error,
                },
            };
        }
    }
    async getFraudStats(options = {}) {
        try {
            const { startDate, endDate } = options;
            const where = {};
            if (startDate || endDate) {
                where.createdAt = {};
                if (startDate)
                    where.createdAt.gte = startDate;
                if (endDate)
                    where.createdAt.lte = endDate;
            }
            const [totalTransactions, flaggedTransactions, averageScoreResult, riskLevelCounts,] = await Promise.all([
                prisma.fraudScore.count({ where }),
                prisma.fraudScore.count({ where: { ...where, flagged: true } }),
                prisma.fraudScore.aggregate({
                    where,
                    _avg: { score: true },
                }),
                prisma.fraudScore.groupBy({
                    by: ['level'],
                    where,
                    _count: { level: true },
                }),
            ]);
            const riskLevelDistribution = riskLevelCounts.reduce((acc, item) => {
                acc[item.level] = item._count.level;
                return acc;
            }, {});
            // Get top risk factors (this is a simplified version)
            const allScores = await prisma.fraudScore.findMany({
                where,
                select: { factors: true },
            });
            const factorCounts = {};
            allScores.forEach((score) => {
                if (score.factors && typeof score.factors === 'object') {
                    Object.keys(score.factors).forEach(factor => {
                        factorCounts[factor] = (factorCounts[factor] || 0) + 1;
                    });
                }
            });
            const topRiskFactors = Object.entries(factorCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10)
                .map(([factor, count]) => ({ factor, count }));
            return {
                success: true,
                data: {
                    totalTransactions,
                    flaggedTransactions,
                    averageRiskScore: Number(averageScoreResult._avg.score || 0),
                    riskLevelDistribution,
                    topRiskFactors,
                },
            };
        }
        catch (error) {
            console.error('Error fetching fraud stats:', error);
            return {
                success: false,
                error: {
                    code: 'FRAUD_STATS_FETCH_FAILED',
                    message: 'Failed to fetch fraud statistics',
                    details: error,
                },
            };
        }
    }
    async collectRiskFactors(context) {
        const factors = {};
        // Amount-based risk
        factors.amountRisk = this.calculateAmountRisk(context.amount);
        // Transaction frequency risk
        if (context.transactionHistory) {
            factors.frequencyRisk = this.calculateFrequencyRisk(context.transactionHistory);
        }
        // Location-based risk
        if (context.location) {
            factors.locationRisk = this.calculateLocationRisk(context.location);
        }
        // Device-based risk
        if (context.deviceId) {
            factors.deviceRisk = await this.calculateDeviceRisk(context.deviceId, context.userId);
        }
        // Time-based risk
        factors.timeRisk = this.calculateTimeRisk();
        // Transaction type risk
        factors.typeRisk = this.calculateTypeRisk(context.type);
        return factors;
    }
    calculateRiskScore(factors) {
        let score = 0;
        // Amount risk (0-25 points)
        score += Math.min(factors.amountRisk || 0, 25);
        // Frequency risk (0-20 points)
        score += Math.min(factors.frequencyRisk || 0, 20);
        // Location risk (0-15 points)
        score += Math.min(factors.locationRisk || 0, 15);
        // Device risk (0-20 points)
        score += Math.min(factors.deviceRisk || 0, 20);
        // Time risk (0-10 points)
        score += Math.min(factors.timeRisk || 0, 10);
        // Type risk (0-10 points)
        score += Math.min(factors.typeRisk || 0, 10);
        return Math.round(score);
    }
    determineRiskLevel(score) {
        if (score < this.RISK_THRESHOLDS.LOW)
            return 'LOW';
        if (score < this.RISK_THRESHOLDS.MEDIUM)
            return 'MEDIUM';
        return 'HIGH';
    }
    calculateAmountRisk(amount) {
        // Higher amounts have higher risk
        if (amount > 1000000)
            return 25;
        if (amount > 500000)
            return 20;
        if (amount > 100000)
            return 15;
        if (amount > 50000)
            return 10;
        if (amount > 10000)
            return 5;
        return 0;
    }
    calculateFrequencyRisk(transactionHistory) {
        const now = new Date();
        const last24Hours = transactionHistory.filter(tx => new Date(tx.createdAt) > new Date(now.getTime() - 24 * 60 * 60 * 1000));
        const last1Hour = transactionHistory.filter(tx => new Date(tx.createdAt) > new Date(now.getTime() - 60 * 60 * 1000));
        let risk = 0;
        if (last1Hour.length > 10)
            risk += 20;
        else if (last1Hour.length > 5)
            risk += 15;
        else if (last1Hour.length > 3)
            risk += 10;
        if (last24Hours.length > 50)
            risk += 20;
        else if (last24Hours.length > 30)
            risk += 15;
        else if (last24Hours.length > 20)
            risk += 10;
        return risk;
    }
    calculateLocationRisk(location) {
        // Simplified location risk calculation
        // In a real system, this would check against known high-risk locations
        const highRiskCountries = ['XX', 'YY', 'ZZ']; // Example high-risk countries
        if (location.country && highRiskCountries.includes(location.country)) {
            return 15;
        }
        return 0;
    }
    async calculateDeviceRisk(deviceId, userId) {
        try {
            // Check if this device has been used before by this user
            const recentTransactions = await prisma.fraudScore.findMany({
                where: {
                    deviceId,
                    wallet: { userId },
                    createdAt: {
                        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
                    },
                },
            });
            if (recentTransactions.length === 0) {
                return 20; // New device
            }
            return 0;
        }
        catch (error) {
            console.error('Error calculating device risk:', error);
            return 10; // Medium risk on error
        }
    }
    calculateTimeRisk() {
        const hour = new Date().getHours();
        // Transactions between 2 AM and 5 AM are higher risk
        if (hour >= 2 && hour <= 5) {
            return 10;
        }
        return 0;
    }
    calculateTypeRisk(type) {
        // Withdrawals are higher risk than credits
        if (type === 'WITHDRAWAL')
            return 10;
        if (type === 'DEBIT')
            return 5;
        return 0;
    }
    mapFraudScoreToData(fraudScore) {
        return {
            id: fraudScore.id,
            walletId: fraudScore.walletId,
            transactionId: fraudScore.transactionId,
            score: fraudScore.score,
            level: fraudScore.level,
            flagged: fraudScore.flagged,
            factors: fraudScore.factors,
            ipAddress: fraudScore.ipAddress,
            userAgent: fraudScore.userAgent,
            deviceId: fraudScore.deviceId,
            location: fraudScore.location,
            reason: fraudScore.reason,
            createdAt: fraudScore.createdAt,
        };
    }
}
exports.FraudScoringService = FraudScoringService;
exports.fraudScoringService = new FraudScoringService();
//# sourceMappingURL=fraudScoringService.js.map