"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// import { webhookController } from '../controllers/webhookController';
const paystackService_1 = require("../services/paystackService");
const paymentService_1 = require("../services/paymentService");
const router = (0, express_1.Router)();
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
/**
 * @swagger
 * /api/webhooks/paystack:
 *   post:
 *     summary: Paystack webhook endpoint
 *     tags: [Webhooks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Paystack webhook event payload
 *             example:
 *               event: charge.success
 *               data:
 *                 id: 123456
 *                 reference: PAY_pay_john123_abc_1234567890
 *                 amount: 500000
 *                 currency: NGN
 *                 status: success
 *                 customer:
 *                   email: customer@example.com
 *     responses:
 *       200:
 *         description: Paystack webhook processed successfully
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
 *                   example: Paystack webhook processed successfully
 *                 event:
 *                   type: string
 *                   example: charge.success
 *                 processed:
 *                   type: boolean
 *                   example: true
 */
// Paystack webhook route
router.post('/paystack', async (req, res) => {
    console.log('🏦 Paystack webhook hit:', req.body);
    try {
        const event = req.body.event;
        const data = req.body.data;
        if (!event || !data) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Paystack webhook payload'
            });
        }
        // Process the webhook
        const webhookResult = paystackService_1.PaystackService.processWebhook(req.body);
        console.log(`🏦 Processing Paystack event: ${event}`);
        // Handle specific Paystack events
        switch (event) {
            case 'charge.success':
                // Payment was successful - verify and update our records
                if (data.reference) {
                    try {
                        await paymentService_1.paymentService.verifyPaystackPayment(data.reference);
                        console.log(`✅ Paystack payment verified via webhook: ${data.reference}`);
                    }
                    catch (error) {
                        console.error('❌ Failed to verify Paystack payment:', error);
                    }
                }
                break;
            case 'charge.failed':
                // Payment failed - update our records
                if (data.reference) {
                    console.log(`❌ Paystack payment failed: ${data.reference}`);
                    // Here you could update the transaction status to FAILED
                }
                break;
            case 'transfer.success':
            case 'transfer.failed':
            case 'transfer.reversed':
                // Handle transfer events if you implement transfers
                console.log(`🏦 Transfer event: ${event}`);
                break;
            default:
                console.log(`🏦 Unhandled Paystack event: ${event}`);
        }
        // Always return 200 to Paystack to acknowledge receipt
        res.status(200).json({
            success: true,
            message: 'Paystack webhook processed successfully',
            event: webhookResult.event,
            processed: webhookResult.processed
        });
    }
    catch (error) {
        console.error('❌ Paystack webhook error:', error);
        // Still return 200 to avoid Paystack retrying
        res.status(200).json({
            success: false,
            message: 'Webhook processed with errors',
            error: error instanceof Error ? error.message : String(error)
        });
    }
});
console.log('📝 Webhook routes registered:');
console.log('  POST /:provider');
console.log('  POST /paystack');
exports.default = router;
//# sourceMappingURL=webhookRoutes.js.map