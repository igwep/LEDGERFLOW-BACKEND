import { Router } from 'express';
import { paymentService, PaymentRequest } from '../services/paymentService';
import { transactionService } from '../services/transactionService';

const router = Router();

console.log('💳 Payment routes module loaded!');

/**
 * @swagger
 * /api/payments/test:
 *   get:
 *     summary: Test payment routes
 *     tags: [Payments]
 *     responses:
 *       200:
 *         description: Payment routes working successfully
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
 *                   example: Payment routes are working!
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
// Test route to verify payment routes are working
router.get('/test', (req, res) => {
  console.log('🧪 Payment routes test endpoint hit!');
  res.json({
    success: true,
    message: 'Payment routes are working!',
    timestamp: new Date().toISOString()
  });
});

/**
 * @swagger
 * /api/payments/{endpoint}:
 *   post:
 *     summary: Process payment via unique payment endpoint
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: endpoint
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique payment endpoint (e.g., pay_john123_abc)
 *         example: pay_john123_abc
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PaymentRequest'
 *     responses:
 *       200:
 *         description: Payment processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentResponse'
 *       400:
 *         description: Bad request - Invalid payment data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Payment endpoint not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
/**
 * Process payment via unique endpoint
 * POST /api/payments/:endpoint
 */
router.post('/:endpoint', async (req, res) => {
  console.log(`💳 POST /api/payments/${req.params.endpoint} route hit:`, req.body);
  
  try {
    const { endpoint } = req.params;
    const paymentData: PaymentRequest = req.body;

    // Basic validation
    if (!endpoint) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_ENDPOINT',
          message: 'Payment endpoint is required'
        }
      });
    }

    if (!paymentData || !paymentData.amount) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_AMOUNT',
          message: 'Payment amount is required'
        }
      });
    }

    // Process payment
    const result = await paymentService.processPayment(endpoint, paymentData);

    if (result.success) {
      console.log(`✅ Payment processed successfully: ${result.data?.reference}`);
      
      // Handle redirect if provided
      if (result.data?.redirectUrl) {
        return res.status(200).json({
          success: true,
          data: result.data,
          redirectUrl: result.data.redirectUrl
        });
      }

      return res.status(200).json({
        success: true,
        data: result.data
      });
    } else {
      console.log(`❌ Payment processing failed:`, result.error);
      return res.status(400).json(result);
    }

  } catch (error) {
    console.error('❌ Payment processing error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Payment processing failed: ' + (error instanceof Error ? error.message : String(error))
      }
    });
  }
});

/**
 * @swagger
 * /api/payments/status/{reference}:
 *   get:
 *     summary: Check payment status by reference
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: reference
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment reference number
 *         example: pay_ref_123456
 *     responses:
 *       200:
 *         description: Payment status retrieved successfully
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
 *                     reference:
 *                       type: string
 *                       example: pay_ref_123456
 *                     status:
 *                       type: string
 *                       enum: [pending, completed, failed]
 *                       example: completed
 *                     amount:
 *                       type: number
 *                       example: 5000
 *                     currency:
 *                       type: string
 *                       example: USD
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request - Missing reference
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Payment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
/**
 * Check payment status
 * GET /api/payments/status/:reference
 */
router.get('/status/:reference', async (req, res) => {
  console.log(`📊 GET /api/payments/status/${req.params.reference} route hit`);
  
  try {
    const { reference } = req.params;

    if (!reference) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_REFERENCE',
          message: 'Transaction reference is required'
        }
      });
    }

    const result = await paymentService.getPaymentStatus(reference);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(404).json(result);
    }

  } catch (error) {
    console.error('❌ Payment status check error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to check payment status'
      }
    });
  }
});

/**
 * @swagger
 * /api/payments/history/{userId}:
 *   get:
 *     summary: Get payment history for a user
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *         example: user_12345
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Maximum number of payments to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of payments to skip
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed, failed]
 *         description: Filter by payment status
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter payments from this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter payments until this date
 *     responses:
 *       200:
 *         description: Payment history retrieved successfully
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
 *                     payments:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Transaction'
 *                     total:
 *                       type: integer
 *                       example: 100
 *                     hasMore:
 *                       type: boolean
 *                       example: true
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         limit:
 *                           type: integer
 *                           example: 20
 *                         offset:
 *                           type: integer
 *                           example: 0
 *                         total:
 *                           type: integer
 *                           example: 100
 *       400:
 *         description: Bad request - Missing user ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
/**
 * Get payment history for a user
 * GET /api/payments/history/:userId
 */
router.get('/history/:userId', async (req, res) => {
  console.log(`📜 GET /api/payments/history/${req.params.userId} route hit`);
  
  try {
    const { userId } = req.params;
    const { 
      limit, 
      offset, 
      status, 
      startDate, 
      endDate 
    } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_USER_ID',
          message: 'User ID is required'
        }
      });
    }

    // For now, return a simple mock response for payment history
    const result = {
      success: true,
      data: {
        payments: [],
        total: 0,
        hasMore: false,
        pagination: { limit: 20, offset: 0, total: 0 }
      }
    };

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(500).json(result);
    }

  } catch (error) {
    console.error('❌ Payment history error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get payment history'
      }
    });
  }
});

export default router;
