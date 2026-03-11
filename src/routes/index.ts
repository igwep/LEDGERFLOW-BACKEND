import { Router } from 'express';
// import walletRoutes from './walletRoutes';
// import transactionRoutes from './transactionRoutes';
// import withdrawalRoutes from './withdrawalRoutes';
import webhookRoutes from './webhookRoutes';
import userRoutes from './userRoutes';
import paymentRoutes from './paymentRoutes';
import paymentRoutesSimple from './paymentRoutesSimple';

console.log('👤 UserRoutes imported:', userRoutes);

const router = Router();

console.log('🛣️  Main routes module loading...');

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
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
 *                     status:
 *                       type: string
 *                       example: LedgerFlow API Running
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     version:
 *                       type: string
 *                       example: 1.0.0
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
router.get('/health', (req, res) => {
  console.log('🏥 Health check route hit');
  res.json({
    success: true,
    data: {
      status: 'LedgerFlow API Running',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || 'unknown',
    },
  });
});

/**
 * @swagger
 * /api/debug-test:
 *   get:
 *     summary: Debug test endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Debug test successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Main routes are working!
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
// Debug route to test main routes
router.get('/debug-test', (req, res) => {
  console.log('🧪 Debug test route hit!');
  res.json({
    success: true,
    message: 'Main routes are working!',
    timestamp: new Date().toISOString()
  });
});

/**
 * @swagger
 * /api/webhooks-direct/{provider}:
 *   post:
 *     summary: Direct webhook test endpoint
 *     tags: [Webhooks]
 *     parameters:
 *       - in: path
 *         name: provider
 *         required: true
 *         schema:
 *           type: string
 *         description: Webhook provider name
 *         example: stripe
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Webhook payload
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Direct main routes webhook working!
 *                 provider:
 *                   type: string
 *                   example: stripe
 *                 body:
 *                   type: object
 *                   description: Webhook payload
 */
// Direct webhook test in main routes
router.post('/webhooks-direct/:provider', (req, res) => {
  console.log('🎯 Direct main routes webhook hit:', req.params.provider);
  res.json({
    success: true,
    message: 'Direct main routes webhook working!',
    provider: req.params.provider,
    body: req.body
  });
});

// API routes
console.log('📦 Mounting webhook routes...');
router.use('/webhooks', webhookRoutes);

/**
 * @swagger
 * /api/users/test:
 *   get:
 *     summary: Test user routes (direct)
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: User routes test successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User routes are working (directly added)!
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
console.log('👤 Adding user routes directly...');
// Add user routes directly here to test
router.get('/users/test', (req, res) => {
  console.log('🧪 Direct user routes test endpoint hit!');
  res.json({
    success: true,
    message: 'User routes are working (directly added)!',
    timestamp: new Date().toISOString()
  });
});

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user (mock implementation)
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: test@example.com
 *               name:
 *                 type: string
 *                 example: Test User
 *               password:
 *                 type: string
 *                 example: password123
 *               role:
 *                 type: string
 *                 enum: [USER, MERCHANT, ADMIN]
 *                 example: USER
 *     responses:
 *       201:
 *         description: User created successfully (mock)
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
 *                     id:
 *                       type: string
 *                       example: test_user_1234567890
 *                     email:
 *                       type: string
 *                       example: test@example.com
 *                     name:
 *                       type: string
 *                       example: Test User
 *                     role:
 *                       type: string
 *                       example: USER
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/users', async (req, res) => {
  console.log('👤 Direct POST /users route hit:', req.body);
  
  try {
    const { email, name, password, role = 'USER' } = req.body;
    
    // Mock user creation for testing
    const mockUser = {
      id: 'test_user_' + Date.now(),
      email,
      name,
      role,
      createdAt: new Date().toISOString()
    };
    
    res.status(201).json({
      success: true,
      data: mockUser
    });
  } catch (error) {
    console.error('❌ Error creating user:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create user'
      }
    });
  }
});

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (mock implementation)
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Users retrieved successfully (mock)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: test_user_1
 *                       email:
 *                         type: string
 *                         example: test1@example.com
 *                       name:
 *                         type: string
 *                         example: Test User 1
 *                       role:
 *                         type: string
 *                         example: USER
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/users', async (req, res) => {
  console.log('👥 Direct GET /users route hit');
  
  try {
    // Mock users for testing
    const mockUsers = [
      {
        id: 'test_user_1',
        email: 'test1@example.com',
        name: 'Test User 1',
        role: 'USER',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    res.json({
      success: true,
      data: mockUsers
    });
  } catch (error) {
    console.error('❌ Error getting users:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get users'
      }
    });
  }
});

console.log('👤 Mounting user routes...');
console.log('👤 User routes object:', userRoutes);
router.use('/users', userRoutes);

console.log('💳 Mounting payment routes...');
console.log('💳 Payment routes object:', paymentRoutes);
router.use('/payments', paymentRoutes);

console.log('💳 Mounting simple payment routes...');
console.log('💳 Simple payment routes object:', paymentRoutesSimple);
router.use('/payments', paymentRoutesSimple);

console.log('✅ Routes registered:');
console.log('  /api/health');
console.log('  /api/webhooks-direct/:provider');
console.log('  /api/webhooks/*');
console.log('  /api/users/*');
console.log('  /api/payments/*');

export default router;
  