"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupExpiredIdempotencyKeys = exports.cacheIdempotentResponse = exports.idempotencyProtection = void 0;
const { PrismaClient } = require('@prisma/client');
const types_1 = require("../types");
const prisma = new PrismaClient();
const idempotencyProtection = (ttlMinutes = 60) => {
    return async (req, res, next) => {
        const idempotencyKey = req.headers['x-idempotency-key'];
        if (!idempotencyKey) {
            return next();
        }
        try {
            // Check if idempotency key exists
            const existingKey = await prisma.idempotencyKey.findUnique({
                where: { key: idempotencyKey },
            });
            if (existingKey) {
                // Check if the key has expired
                if (existingKey.expiresAt && existingKey.expiresAt < new Date()) {
                    // Clean up expired key and continue
                    await prisma.idempotencyKey.delete({
                        where: { id: existingKey.id },
                    });
                    return next();
                }
                // Return cached response
                if (existingKey.response && existingKey.statusCode) {
                    return res.status(existingKey.statusCode).json(existingKey.response);
                }
                // Key exists but no response cached - this shouldn't happen
                throw new types_1.IdempotencyError('Idempotency key exists but no response cached');
            }
            // Store the idempotency key with expiration
            const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);
            await prisma.idempotencyKey.create({
                data: {
                    key: idempotencyKey,
                    expiresAt,
                },
            });
            // Add the key to request for later use
            req.idempotencyKey = idempotencyKey;
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.idempotencyProtection = idempotencyProtection;
const cacheIdempotentResponse = (idempotencyKey, response, statusCode) => {
    return async () => {
        try {
            await prisma.idempotencyKey.update({
                where: { key: idempotencyKey },
                data: {
                    response,
                    statusCode,
                },
            });
        }
        catch (error) {
            // Log error but don't fail the request
            console.error('Failed to cache idempotent response:', error);
        }
    };
};
exports.cacheIdempotentResponse = cacheIdempotentResponse;
// Cleanup expired idempotency keys (should be run periodically)
const cleanupExpiredIdempotencyKeys = async () => {
    try {
        const result = await prisma.idempotencyKey.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date(),
                },
            },
        });
        console.log(`Cleaned up ${result.count} expired idempotency keys`);
    }
    catch (error) {
        console.error('Failed to cleanup expired idempotency keys:', error);
    }
};
exports.cleanupExpiredIdempotencyKeys = cleanupExpiredIdempotencyKeys;
//# sourceMappingURL=idempotency.js.map