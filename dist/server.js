"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const routes_1 = __importDefault(require("./routes"));
const common_1 = require("./middleware/common");
const errorHandler_1 = require("./middleware/errorHandler");
const swagger_1 = require("./config/swagger");
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware
app.use((0, helmet_1.default)());
app.use((0, common_1.corsMiddleware)({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true,
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)('dev'));
app.use((0, common_1.requestIdMiddleware)());
// Routes
console.log('🔗 About to mount routes...');
console.log('🔗 Routes imported:', typeof routes_1.default);
app.use('/api', routes_1.default);
// Swagger Documentation
app.use('/api-docs', swagger_1.swaggerUi.serve, swagger_1.swaggerUi.setup(swagger_1.specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'LedgerFlow Payment Gateway API Documentation',
}));
// Swagger JSON endpoint
app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swagger_1.specs);
});
/**
 * @swagger
 * /:
 *   get:
 *     summary: API root endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: LedgerFlow API
 *                     version:
 *                       type: string
 *                       example: 1.0.0
 *                     status:
 *                       type: string
 *                       example: running
 *                 meta:
 *                   type: object
 *                   properties:
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     requestId:
 *                       type: string
 */
// Health check
app.get('/', (req, res) => {
    res.json({
        success: true,
        data: {
            name: 'LedgerFlow API',
            version: '1.0.0',
            status: 'running',
        },
        meta: {
            timestamp: new Date().toISOString(),
            requestId: req.requestId,
        },
    });
});
// Debug: Add a test route to verify Express routing works
app.get('/api/test', (req, res) => {
    console.log('🧪 Test route hit!');
    res.json({
        success: true,
        message: 'Test route working!',
        timestamp: new Date().toISOString()
    });
});
// Working webhook route
app.post('/api/webhooks/:provider', (req, res) => {
    console.log('🎯 Webhook route hit:', req.params.provider);
    console.log('📦 Webhook body:', req.body);
    // Here you can integrate with your webhookController
    // For now, return a success response
    res.json({
        success: true,
        message: 'Webhook processed successfully!',
        provider: req.params.provider,
        body: req.body,
        meta: {
            timestamp: new Date().toISOString(),
            requestId: req.requestId || 'unknown'
        }
    });
});
// Test Prisma directly in server
app.get('/api/prisma-test', async (req, res) => {
    console.log('🧪 Testing Prisma directly...');
    try {
        // Try using Prisma with explicit configuration
        const prismaImport = await Promise.resolve().then(() => __importStar(require('@prisma/client')));
        const { PrismaClient } = prismaImport;
        console.log('🔍 DATABASE_URL:', process.env.DATABASE_URL);
        // Create PrismaClient instance
        const prisma = new PrismaClient();
        console.log('✅ PrismaClient created');
        const userCount = await prisma.user.count();
        await prisma.$disconnect();
        res.json({
            success: true,
            message: 'Prisma test successful!',
            userCount: userCount,
            databaseUrl: process.env.DATABASE_URL
        });
    }
    catch (error) {
        console.error('❌ Prisma test failed:', error);
        res.status(500).json({
            success: false,
            error: 'Prisma test failed: ' + (error instanceof Error ? error.message : String(error))
        });
    }
});
// User routes added directly to server - using Prisma database
app.get('/api/users/test', (req, res) => {
    console.log('🧪 User routes test endpoint hit!');
    res.json({
        success: true,
        message: 'User routes are working (with Prisma database)!',
        timestamp: new Date().toISOString()
    });
});
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
// Mount user routes properly
app.use('/api/users', userRoutes_1.default);
// Error handling (MUST be after all routes)
app.use(errorHandler_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 LedgerFlow API server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/`);
    console.log(`🔗 API docs: http://localhost:${PORT}/api/health`);
    console.log(`📚 Swagger Documentation: http://localhost:${PORT}/api-docs`);
});
//# sourceMappingURL=server.js.map