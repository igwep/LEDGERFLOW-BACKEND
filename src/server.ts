import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import morgan from 'morgan'
import routes from './routes'
import { requestIdMiddleware, corsMiddleware } from './middleware/common'
import { errorHandler, notFoundHandler } from './middleware/errorHandler'
import { AuthenticatedRequest } from './types'
import { specs, swaggerUi } from './config/swagger'

dotenv.config()

const app = express()

// Middleware
app.use(helmet())
app.use(corsMiddleware({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))
app.use(requestIdMiddleware())

// Routes
console.log('🔗 About to mount routes...');
console.log('🔗 Routes imported:', typeof routes);
app.use('/api', routes)

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'LedgerFlow Payment Gateway API Documentation',
}))

// Swagger JSON endpoint
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.send(specs)
})

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
app.get('/', (req: AuthenticatedRequest, res) => {
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
  })
})

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
app.post('/api/webhooks/:provider', (req: AuthenticatedRequest, res) => {
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
    const prismaImport = await import('@prisma/client');
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
  } catch (error) {
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

import userRoutes from './routes/userRoutes';

// Mount user routes properly
app.use('/api/users', userRoutes);

// Error handling (MUST be after all routes)
app.use(notFoundHandler)
app.use(errorHandler)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`🚀 LedgerFlow API server running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/`)
  console.log(`🔗 API docs: http://localhost:${PORT}/api/health`)
  console.log(`📚 Swagger Documentation: http://localhost:${PORT}/api-docs`)
})