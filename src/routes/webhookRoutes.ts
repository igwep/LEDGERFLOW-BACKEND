import { Router } from 'express';
// import { webhookController } from '../controllers/webhookController';

const router = Router();

console.log('🔗 Webhook routes module loaded');

/**
 * @swagger
 * /api/webhooks/{provider}:
 *   post:
 *     summary: Webhook endpoint for payment providers
 *     tags: [Webhooks]
 *     parameters:
 *       - in: path
 *         name: provider
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment provider name
 *         example: stripe
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Webhook event payload
 *             example:
 *               event: payment.completed
 *               data:
 *                 payment_id: pay_123456
 *                 amount: 5000
 *                 status: completed
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
 *                   example: Webhook route working!
 *                 provider:
 *                   type: string
 *                   example: stripe
 *                 body:
 *                   type: object
 *                   description: Webhook payload
 */
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
