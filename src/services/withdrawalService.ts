import { Prisma, PrismaClient as PrismaClientType } from '@prisma/client';
import { 
  ServiceResponse, 
  WithdrawalData, 
  InsufficientFundsError,
  NotFoundError,
  ConflictError 
} from '../types';
import { walletService } from './walletService';
import { transactionService } from './transactionService';

const prisma = new PrismaClientType();

export class WithdrawalService {
  async createWithdrawal(
    userId: string,
    amount: number,
    bankName: string,
    accountNumber: string,
    accountName: string,
    options: {
      description?: string;
      idempotencyKey?: string;
    } = {}
  ): Promise<ServiceResponse<WithdrawalData>> {
    return await prisma.$transaction(async (tx: Omit<PrismaClientType, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$queryRaw" | "$executeRaw" | "$executeRawUnsafe" | "$runCommandRaw" | "$extends">) => {
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
                data: existingKey.response as unknown as WithdrawalData,
              };
            }
            throw new ConflictError('Idempotency key conflict');
          }
        }

        // Get wallet
        const wallet = await tx.wallet.findUnique({
          where: { userId },
        });

        if (!wallet) {
          throw new NotFoundError('Wallet');
        }

        const availableBalance = Number(wallet.available);
        
        if (availableBalance < amount) {
          throw new InsufficientFundsError('Insufficient available balance for withdrawal');
        }

        // Lock funds for withdrawal
        const lockResult = await walletService.lockFunds(
          wallet.id,
          amount,
          `Funds locked for withdrawal to ${bankName} - ${accountNumber}`
        );

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
              response: this.mapWithdrawalToData(withdrawal) as any,
              statusCode: 201,
            },
          });
        }

        return {
          success: true,
          data: this.mapWithdrawalToData(withdrawal),
        };
      } catch (error) {
        console.error('Error creating withdrawal:', error);
        throw error;
      }
    });
  }

  async processWithdrawal(
    withdrawalId: string,
    status: 'PROCESSING' | 'SUCCESS' | 'FAILED',
    options: {
      transferRef?: string;
      metadata?: Record<string, any>;
    } = {}
  ): Promise<ServiceResponse<WithdrawalData>> {
    return await prisma.$transaction(async (tx: Omit<PrismaClientType, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$queryRaw" | "$executeRaw" | "$executeRawUnsafe" | "$runCommandRaw" | "$extends">) => {
      try {
        // Get withdrawal
        const withdrawal = await tx.withdrawal.findUnique({
          where: { id: withdrawalId },
          include: { user: true },
        });

        if (!withdrawal) {
          throw new NotFoundError('Withdrawal');
        }

        if (withdrawal.status === 'SUCCESS' || withdrawal.status === 'FAILED') {
          throw new ConflictError('Withdrawal already processed');
        }

        // Get wallet
        const wallet = await tx.wallet.findUnique({
          where: { userId: withdrawal.userId },
        });

        if (!wallet) {
          throw new NotFoundError('Wallet');
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
          const transactionResult = await transactionService.initializeTransaction(
            withdrawal.userId,
            Number(withdrawal.amount),
            'NGN', // Default currency, should be configurable
            'DEBIT',
            {
              description: `Withdrawal to ${withdrawal.bankName} - ${withdrawal.accountNumber}`,
              metadata: {
                withdrawalId: withdrawal.id,
                bankName: withdrawal.bankName,
                accountNumber: withdrawal.accountNumber,
                transferRef: updatedWithdrawal.transferRef,
                ...options.metadata,
              },
            }
          );

          if (!transactionResult.success) {
            throw new Error(transactionResult.error?.message || 'Failed to create withdrawal transaction');
          }

          // Process the transaction
          const processResult = await transactionService.processTransaction(
            transactionResult.data!.reference,
            {
              providerRef: updatedWithdrawal.transferRef ?? undefined,
              metadata: options.metadata,
            }
          );

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

        } else if (status === 'FAILED') {
          // If withdrawal failed, unlock the funds back to available balance
          const unlockResult = await walletService.unlockFunds(
            wallet.id,
            Number(withdrawal.amount),
            `Withdrawal failed - funds unlocked: ${options.transferRef || withdrawal.transferRef}`
          );

          if (!unlockResult.success) {
            throw new Error(unlockResult.error?.message || 'Failed to unlock funds');
          }
        }

        return {
          success: true,
          data: this.mapWithdrawalToData(updatedWithdrawal),
        };
      } catch (error) {
        console.error('Error processing withdrawal:', error);
        throw error;
      }
    });
  }

  async getWithdrawal(withdrawalId: string): Promise<ServiceResponse<WithdrawalData>> {
    try {
      const withdrawal = await prisma.withdrawal.findUnique({
        where: { id: withdrawalId },
        include: { user: true },
      });

      if (!withdrawal) {
        throw new NotFoundError('Withdrawal');
      }

      return {
        success: true,
        data: this.mapWithdrawalToData(withdrawal),
      };
    } catch (error) {
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

  async listWithdrawals(
    userId: string,
    options: {
      status?: string;
      limit?: number;
      offset?: number;
      startDate?: Date;
      endDate?: Date;
    } = {}
  ): Promise<ServiceResponse<{ withdrawals: WithdrawalData[]; total: number }>> {
    try {
      const { limit = 20, offset = 0, status, startDate, endDate } = options;

      const where: any = { userId };
      
      if (status) where.status = status;
      
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = startDate;
        if (endDate) where.createdAt.lte = endDate;
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
    } catch (error) {
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

  async cancelWithdrawal(
    withdrawalId: string,
    reason?: string
  ): Promise<ServiceResponse<WithdrawalData>> {
    return await prisma.$transaction(async (tx: Omit<PrismaClientType, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$queryRaw" | "$executeRaw" | "$executeRawUnsafe" | "$runCommandRaw" | "$extends">) => {
      try {
        const withdrawal = await tx.withdrawal.findUnique({
          where: { id: withdrawalId },
        });

        if (!withdrawal) {
          throw new NotFoundError('Withdrawal');
        }

        if (withdrawal.status !== 'PENDING') {
          throw new ConflictError('Only pending withdrawals can be cancelled');
        }

        // Get wallet
        const wallet = await tx.wallet.findUnique({
          where: { userId: withdrawal.userId },
        });

        if (!wallet) {
          throw new NotFoundError('Wallet');
        }

        // Unlock the funds back to available balance
        const unlockResult = await walletService.unlockFunds(
          wallet.id,
          Number(withdrawal.amount),
          `Withdrawal cancelled - funds unlocked: ${reason || 'User request'}`
        );

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
      } catch (error) {
        console.error('Error cancelling withdrawal:', error);
        throw error;
      }
    });
  }

  async getWithdrawalStats(
    userId: string,
    options: {
      startDate?: Date;
      endDate?: Date;
    } = {}
  ): Promise<ServiceResponse<{
    totalWithdrawals: number;
    totalAmount: number;
    pendingWithdrawals: number;
    processingWithdrawals: number;
    completedWithdrawals: number;
    failedWithdrawals: number;
  }>> {
    try {
      const { startDate, endDate } = options;

      const where: any = { userId };
      
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = startDate;
        if (endDate) where.createdAt.lte = endDate;
      }

      const [
        totalWithdrawals,
        totalAmountResult,
        statusCounts,
      ] = await Promise.all([
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

      const statusMap = statusCounts.reduce((acc: Record<string, number>, item: { status: string; _count: { status: number } }) => {
        acc[item.status] = item._count.status;
        return acc;
      }, {} as Record<string, number>);

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
    } catch (error) {
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

  private generateTransferReference(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8);
    return `TXF_${timestamp}_${random}`.toUpperCase();
  }

  private mapWithdrawalToData(withdrawal: any): WithdrawalData {
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

export const withdrawalService = new WithdrawalService();
