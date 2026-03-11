import { Request, Response } from 'express';
import { withdrawalService } from '../services/withdrawalService';
import { AuthenticatedRequest } from '../types';

export class WithdrawalController {
  async createWithdrawal(req: AuthenticatedRequest, res: Response) {
    try {
      const { 
        userId, 
        amount, 
        bankName, 
        accountNumber, 
        accountName,
        description,
        idempotencyKey 
      } = req.body;

      const result = await withdrawalService.createWithdrawal(
        userId,
        amount,
        bankName,
        accountNumber,
        accountName,
        {
          description,
          idempotencyKey,
        }
      );
      
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
    } catch (error) {
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

  async processWithdrawal(req: AuthenticatedRequest, res: Response) {
    try {
      const { withdrawalId } = req.params;
      const withdrawalIdString = Array.isArray(withdrawalId) ? withdrawalId[0] : withdrawalId;
      const { status, transferRef, metadata } = req.body;

      const result = await withdrawalService.processWithdrawal(withdrawalIdString, status, {
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
    } catch (error) {
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

  async getWithdrawal(req: AuthenticatedRequest, res: Response) {
    try {
      const { withdrawalId } = req.params;
      const withdrawalIdString = Array.isArray(withdrawalId) ? withdrawalId[0] : withdrawalId;
      const result = await withdrawalService.getWithdrawal(withdrawalIdString);
      
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

    } catch (error) {
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

  async listWithdrawals(req: AuthenticatedRequest, res: Response) {
    try {
      const { userId } = req.params;
      const { 
        status, 
        limit, 
        offset, 
        startDate, 
        endDate 
      } = req.query;

      const result = await withdrawalService.listWithdrawals(String(userId), {
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

    } catch (error) {
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

  async cancelWithdrawal(req: AuthenticatedRequest, res: Response) {
    try {
      const { withdrawalId } = req.params;
      const withdrawalIdString = Array.isArray(withdrawalId) ? withdrawalId[0] : withdrawalId;
      const { reason } = req.body;

      const result = await withdrawalService.cancelWithdrawal(withdrawalIdString, reason);
      
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
    } catch (error) {
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

  async getWithdrawalStats(req: AuthenticatedRequest, res: Response) {
    try {
      const { userId } = req.params;
      const { startDate, endDate } = req.query;

      const result = await withdrawalService.getWithdrawalStats(String(userId), {
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
    } catch (error) {
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

export const withdrawalController = new WithdrawalController();
