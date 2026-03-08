import { ServiceResponse, FraudScoreData, FraudDetectionResult, FraudContext } from '../types';
export declare class FraudScoringService {
    private readonly RISK_THRESHOLDS;
    analyzeTransaction(context: FraudContext): Promise<ServiceResponse<FraudDetectionResult>>;
    saveFraudScore(transactionId: string, walletId: string, result: FraudDetectionResult, context: FraudContext): Promise<ServiceResponse<FraudScoreData>>;
    getFraudScore(transactionId: string): Promise<ServiceResponse<FraudScoreData>>;
    getUserFraudHistory(userId: string, options?: {
        limit?: number;
        offset?: number;
        startDate?: Date;
        endDate?: Date;
    }): Promise<ServiceResponse<{
        fraudScores: FraudScoreData[];
        total: number;
    }>>;
    getFraudStats(options?: {
        startDate?: Date;
        endDate?: Date;
    }): Promise<ServiceResponse<{
        totalTransactions: number;
        flaggedTransactions: number;
        averageRiskScore: number;
        riskLevelDistribution: Record<string, number>;
        topRiskFactors: Array<{
            factor: string;
            count: number;
        }>;
    }>>;
    private collectRiskFactors;
    private calculateRiskScore;
    private determineRiskLevel;
    private calculateAmountRisk;
    private calculateFrequencyRisk;
    private calculateLocationRisk;
    private calculateDeviceRisk;
    private calculateTimeRisk;
    private calculateTypeRisk;
    private mapFraudScoreToData;
}
export declare const fraudScoringService: FraudScoringService;
//# sourceMappingURL=fraudScoringService.d.ts.map