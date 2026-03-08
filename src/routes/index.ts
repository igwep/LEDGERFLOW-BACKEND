import { Router } from 'express';
// import walletRoutes from './walletRoutes';
// import transactionRoutes from './transactionRoutes';
// import withdrawalRoutes from './withdrawalRoutes';
import webhookRoutes from './webhookRoutes';
import userRoutes from './userRoutes';
import paymentRoutes from './paymentRoutes';

console.log('👤 UserRoutes imported:', userRoutes);

const router = Router();

console.log('🛣️  Main routes module loading...');

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

// Debug route to test main routes
router.get('/debug-test', (req, res) => {
  console.log('🧪 Debug test route hit!');
  res.json({
    success: true,
    message: 'Main routes are working!',
    timestamp: new Date().toISOString()
  });
});

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

console.log('✅ Routes registered:');
console.log('  /api/health');
console.log('  /api/webhooks-direct/:provider');
console.log('  /api/webhooks/*');
console.log('  /api/users/*');
console.log('  /api/payments/*');

export default router;
  