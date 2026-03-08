import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { 
  AppError, 
  ValidationError, 
  NotFoundError, 
  ConflictError,
  InsufficientFundsError,
  WalletLockedError,
  IdempotencyError,
  FraudDetectionError,
  WebhookSignatureError,
  AuthenticatedRequest 
} from '../types';

export const errorHandler = (
  error: Error,
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const requestId = req.requestId || 'unknown';
  const timestamp = new Date().toISOString();

  // Log error for debugging
  console.error(`[${requestId}] Error:`, {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    query: req.query,
    params: req.params,
  });

  // Handle different error types
  if (error instanceof ZodError) {
    const validationErrors = error.issues.map(err => ({
      field: err.path.join('.'),
      message: err.message,
    }));

    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: validationErrors,
      },
      meta: {
        timestamp,
        requestId,
      },
    });
  }

  if (error instanceof ValidationError) {
    return res.status(400).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
      meta: {
        timestamp,
        requestId,
      },
    });
  }

  if (error instanceof NotFoundError) {
    return res.status(404).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
      },
      meta: {
        timestamp,
        requestId,
      },
    });
  }

  if (error instanceof ConflictError) {
    return res.status(409).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
      },
      meta: {
        timestamp,
        requestId,
      },
    });
  }

  if (error instanceof InsufficientFundsError) {
    return res.status(400).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
      },
      meta: {
        timestamp,
        requestId,
      },
    });
  }

  if (error instanceof WalletLockedError) {
    return res.status(423).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
      },
      meta: {
        timestamp,
        requestId,
      },
    });
  }

  if (error instanceof IdempotencyError) {
    return res.status(409).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
      },
      meta: {
        timestamp,
        requestId,
      },
    });
  }

  if (error instanceof FraudDetectionError) {
    return res.status(403).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
      },
      meta: {
        timestamp,
        requestId,
      },
    });
  }

  if (error instanceof WebhookSignatureError) {
    return res.status(401).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
      },
      meta: {
        timestamp,
        requestId,
      },
    });
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
      meta: {
        timestamp,
        requestId,
      },
    });
  }

  // Handle Prisma errors
  if (error.name === 'PrismaClientKnownRequestError') {
    const prismaError = error as any;
    
    switch (prismaError.code) {
      case 'P2002':
        return res.status(409).json({
          success: false,
          error: {
            code: 'UNIQUE_CONSTRAINT_VIOLATION',
            message: 'Resource already exists',
            details: prismaError.meta,
          },
          meta: {
            timestamp,
            requestId,
          },
        });
      
      case 'P2025':
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Resource not found',
          },
          meta: {
            timestamp,
            requestId,
          },
        });
      
      default:
        return res.status(500).json({
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Database operation failed',
            details: prismaError.code,
          },
          meta: {
            timestamp,
            requestId,
          },
        });
    }
  }

  // Default error response
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
    },
    meta: {
      timestamp,
      requestId,
    },
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  const requestId = req.headers['x-request-id'] as string || 'unknown';
  const timestamp = new Date().toISOString();

  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
    meta: {
      timestamp,
      requestId,
    },
  });
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
