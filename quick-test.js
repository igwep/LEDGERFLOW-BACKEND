// Quick test to check if Paystack routes work when added directly
const express = require('express');
const { paymentService } = require('./dist/services/paymentService');

const app = express();
app.use(express.json());

// Add Paystack payment route directly
app.post('/api/payments/:endpoint/paystack', async (req, res) => {
  console.log(`🏦 POST /api/payments/${req.params.endpoint}/paystack route hit:`, req.body);
  
  try {
    const { endpoint } = req.params;
    const paymentData = req.body;

    console.log('💳 Processing Paystack payment:', { endpoint, amount: paymentData.amount });

    // Basic validation
    if (!paymentData.amount || paymentData.amount < 100) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_AMOUNT',
          message: 'Amount must be at least ₦1.00 (100 kobo)'
        }
      });
    }

    if (!paymentData.customerEmail) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_EMAIL',
          message: 'Customer email is required for Paystack payments'
        }
      });
    }

    // Process payment with Paystack
    const result = await paymentService.processPaymentWithPaystack(endpoint, paymentData);

    if (result.success) {
      console.log(`✅ Paystack payment initialized for ${endpoint}:`, result.data?.reference);
      return res.status(200).json(result);
    } else {
      console.log(`❌ Paystack payment failed:`, result.error);
      return res.status(400).json(result);
    }

  } catch (error) {
    console.error('❌ Paystack payment processing error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Paystack payment processing failed: ' + (error instanceof Error ? error.message : String(error))
      }
    });
  }
});

// Add Paystack verification route directly
app.get('/api/payments/verify/:reference/paystack', async (req, res) => {
  console.log(`🔍 GET /api/payments/verify/${req.params.reference}/paystack route hit`);
  
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

    const result = await paymentService.verifyPaystackPayment(reference);

    if (result.success) {
      console.log(`✅ Paystack payment verified: ${reference}`);
      return res.status(200).json(result);
    } else {
      console.log(`❌ Paystack verification failed: ${reference}`, result.error);
      return res.status(400).json(result);
    }

  } catch (error) {
    console.error('❌ Paystack verification error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to verify Paystack payment'
      }
    });
  }
});

// Add Paystack webhook route directly
app.post('/api/webhooks/paystack', async (req, res) => {
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

    // Handle specific Paystack events
    switch (event) {
      case 'charge.success':
        console.log(`✅ Paystack payment success: ${data.reference}`);
        break;
      case 'charge.failed':
        console.log(`❌ Paystack payment failed: ${data.reference}`);
        break;
      default:
        console.log(`🏦 Paystack event: ${event}`);
    }

    res.status(200).json({
      success: true,
      message: 'Paystack webhook processed successfully',
      event,
      processed: true
    });

  } catch (error) {
    console.error('❌ Paystack webhook error:', error);
    res.status(200).json({
      success: false,
      message: 'Webhook processed with errors',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

const PORT = 5001; // Use different port to avoid conflict
app.listen(PORT, () => {
  console.log(`🧪 Quick test server running on port ${PORT}`);
  console.log(`📝 Test endpoints:`);
  console.log(`  POST http://localhost:${PORT}/api/payments/test_endpoint/paystack`);
  console.log(`  GET  http://localhost:${PORT}/api/payments/verify/test_ref/paystack`);
  console.log(`  POST http://localhost:${PORT}/api/webhooks/paystack`);
});
