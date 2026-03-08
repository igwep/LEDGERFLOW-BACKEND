import { Router } from 'express';
// import { webhookController } from '../controllers/webhookController';

const router = Router();

console.log('🔗 Webhook routes module loaded');

// Simple test route
router.post('/:provider', (req, res) => {
  console.log('🎯 Webhook POST route hit:', req.params.provider);
  res.json({
    success: true,
    message: 'Webhook route working!',
    provider: req.params.provider,
    body: req.body
  });
});

console.log('📝 Webhook routes registered:');
console.log('  POST /:provider');

export default router;
