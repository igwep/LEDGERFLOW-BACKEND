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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const endpointGenerator_1 = require("../utils/endpointGenerator");
const router = (0, express_1.Router)();
console.log('👤 User routes module loaded!');
// Test route to verify user routes are working
router.get('/test', (req, res) => {
    console.log('🧪 User routes test endpoint hit!');
    res.json({
        success: true,
        message: 'User routes are working with database!',
        timestamp: new Date().toISOString()
    });
});
// Create user (working database integration)
router.post('/', async (req, res) => {
    console.log('👤 POST /users route hit:', req.body);
    try {
        // Load environment variables first
        const { config } = await Promise.resolve().then(() => __importStar(require('dotenv')));
        config();
        // Import PrismaClient dynamically
        const { PrismaClient } = await Promise.resolve().then(() => __importStar(require('@prisma/client')));
        // Create Prisma client - it will use DATABASE_URL from env
        const prisma = new PrismaClient();
        const { email, name, password, role = 'USER' } = req.body;
        console.log('🔍 Creating user with email:', email);
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });
        if (existingUser) {
            await prisma.$disconnect();
            return res.status(400).json({
                success: false,
                error: {
                    code: 'USER_EXISTS',
                    message: 'User with this email already exists'
                }
            });
        }
        // Generate unique payment endpoint
        const paymentEndpoint = await (0, endpointGenerator_1.generatePaymentEndpoint)(name || email.split('@')[0]);
        // Create user in database
        const user = await prisma.user.create({
            data: {
                email,
                name,
                password, // Note: In production, hash this password
                role,
                paymentEndpoint: paymentEndpoint // Temporary fix for type issue
            }
        });
        await prisma.$disconnect();
        console.log('✅ User created in database:', user.id);
        res.status(201).json({
            success: true,
            data: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                paymentEndpoint: user.paymentEndpoint,
                createdAt: user.createdAt
            }
        });
    }
    catch (error) {
        console.error('❌ Error creating user:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to create user: ' + (error instanceof Error ? error.message : String(error))
            }
        });
    }
});
// Get all users (working database integration)
router.get('/', async (req, res) => {
    console.log('👥 Getting all users from database');
    try {
        // Import PrismaClient dynamically with proper configuration
        const { PrismaClient } = await Promise.resolve().then(() => __importStar(require('@prisma/client')));
        // Create Prisma client with explicit SQLite configuration
        const prisma = new PrismaClient({
            datasources: {
                db: {
                    url: "file:./dev.db"
                }
            }
        });
        // Get users from database
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
                updatedAt: true
            }
        });
        await prisma.$disconnect();
        console.log('✅ Users retrieved from database:', users.length);
        res.json({
            success: true,
            data: users
        });
    }
    catch (error) {
        console.error('❌ Error getting users:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to get users: ' + (error instanceof Error ? error.message : String(error))
            }
        });
    }
});
exports.default = router;
//# sourceMappingURL=userRoutes.js.map