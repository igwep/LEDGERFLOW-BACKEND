"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsMiddleware = exports.rateLimiting = exports.webhookSignatureVerification = exports.requestIdMiddleware = exports.generateRequestId = void 0;
const crypto_1 = __importDefault(require("crypto"));
const types_1 = require("../types");
const generateRequestId = () => {
    return crypto_1.default.randomUUID();
};
exports.generateRequestId = generateRequestId;
const requestIdMiddleware = () => {
    return (req, res, next) => {
        const requestId = req.headers['x-request-id'] || (0, exports.generateRequestId)();
        req.requestId = requestId;
        res.setHeader('x-request-id', requestId);
        next();
    };
};
exports.requestIdMiddleware = requestIdMiddleware;
const webhookSignatureVerification = (secret) => {
    return (req, res, next) => {
        const signature = req.headers['x-signature'];
        const payload = JSON.stringify(req.body);
        if (!signature) {
            return next(new types_1.WebhookSignatureError('Missing signature header'));
        }
        // Skip signature verification for development/testing
        if (process.env.NODE_ENV !== 'production' && signature === 'test-signature') {
            console.log('⚠️  Development mode: Skipping signature verification for test-signature');
            return next();
        }
        // Verify signature (using HMAC-SHA256)
        const expectedSignature = crypto_1.default
            .createHmac('sha256', secret)
            .update(payload)
            .digest('hex');
        // Compare signatures securely
        const isValid = crypto_1.default.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSignature, 'hex'));
        if (!isValid) {
            return next(new types_1.WebhookSignatureError('Invalid webhook signature'));
        }
        next();
    };
};
exports.webhookSignatureVerification = webhookSignatureVerification;
const rateLimiting = (options) => {
    const requests = new Map();
    const { windowMs, maxRequests, keyGenerator } = options;
    return (req, res, next) => {
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
exports.rateLimiting = rateLimiting;
const corsMiddleware = (options = {}) => {
    const { origin = '*', methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], allowedHeaders = ['Content-Type', 'Authorization', 'x-idempotency-key', 'x-request-id'], credentials = false, } = options;
    return (req, res, next) => {
        const originHeader = req.headers.origin;
        if (typeof origin === 'string') {
            res.setHeader('Access-Control-Allow-Origin', origin);
        }
        else if (Array.isArray(origin)) {
            if (originHeader && origin.includes(originHeader)) {
                res.setHeader('Access-Control-Allow-Origin', originHeader);
            }
        }
        else {
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
exports.corsMiddleware = corsMiddleware;
//# sourceMappingURL=common.js.map