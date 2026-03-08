import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { AuthenticatedRequest, WebhookSignatureError } from '../types';

export const generateRequestId = () => {
  return crypto.randomUUID();
};

export const requestIdMiddleware = () => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const requestId = req.headers['x-request-id'] as string || generateRequestId();
    req.requestId = requestId;
    res.setHeader('x-request-id', requestId);
    next();
  };
};

export const webhookSignatureVerification = (secret: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const signature = req.headers['x-signature'] as string;
    const payload = JSON.stringify(req.body);

    if (!signature) {
      return next(new WebhookSignatureError('Missing signature header'));
    }

    // Skip signature verification for development/testing
    if (process.env.NODE_ENV !== 'production' && signature === 'test-signature') {
      console.log('⚠️  Development mode: Skipping signature verification for test-signature');
      return next();
    }

    // Verify signature (using HMAC-SHA256)
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    // Compare signatures securely
    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );

    if (!isValid) {
      return next(new WebhookSignatureError('Invalid webhook signature'));
    }

    next();
  };
};

export const rateLimiting = (options: {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (req: Request) => string;
}) => {
  const requests = new Map<string, { count: number; resetTime: number }>();

  const { windowMs, maxRequests, keyGenerator } = options;

  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const key = keyGenerator ? keyGenerator(req) : req.ip || 'unknown';
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean up expired entries
    for (const [k, v] of requests.entries()) {
      if (v.resetTime < now) {
        requests.delete(k);
      }
    }

    // Get or create request counter
    let requestData = requests.get(key);
    if (!requestData || requestData.resetTime < now) {
      requestData = { count: 0, resetTime: now + windowMs };
      requests.set(key, requestData);
    }

    // Check rate limit
    if (requestData.count >= maxRequests) {
      const resetTime = Math.ceil((requestData.resetTime - now) / 1000);
      res.setHeader('x-ratelimit-limit', maxRequests);
      res.setHeader('x-ratelimit-remaining', 0);
      res.setHeader('x-ratelimit-reset', resetTime);
      
      return res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests',
          details: {
            limit: maxRequests,
            windowMs,
            resetTime,
          },
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.requestId,
        },
      });
    }

    // Increment counter
    requestData.count++;
    
    // Set rate limit headers
    res.setHeader('x-ratelimit-limit', maxRequests);
    res.setHeader('x-ratelimit-remaining', maxRequests - requestData.count);
    res.setHeader('x-ratelimit-reset', Math.ceil((requestData.resetTime - now) / 1000));

    next();
  };
};

export const corsMiddleware = (options: {
  origin?: string | string[];
  methods?: string[];
  allowedHeaders?: string[];
  credentials?: boolean;
} = {}) => {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization', 'x-idempotency-key', 'x-request-id'],
    credentials = false,
  } = options;

  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const originHeader = req.headers.origin;
    
    if (typeof origin === 'string') {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (Array.isArray(origin)) {
      if (originHeader && origin.includes(originHeader)) {
        res.setHeader('Access-Control-Allow-Origin', originHeader);
      }
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }

    res.setHeader('Access-Control-Allow-Methods', methods.join(', '));
    res.setHeader('Access-Control-Allow-Headers', allowedHeaders.join(', '));
    
    if (credentials) {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    next();
  };
};
