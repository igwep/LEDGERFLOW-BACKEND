// Clean Paystack test without any database dependencies
require('dotenv').config();

const express = require('express');
const Paystack = require('paystack');

const app = express();
app.use(express.json());

// Initialize Paystack
const secretKey = process.env.PAYSTACK_SECRET_KEY;
const paystack = Paystack(secretKey || 'sk_test_xxxx');

// Paystack payment endpoint (no database)
app.post('/api/paystack-test', async (req, res) => {
  console.log('🏦 Clean Paystack test endpoint hit:', req.body);
  
  try {
    const { amount, description, customerEmail, redirectUrl } = req.body;
    
    // Basic validation
    if (!amount || amount < 100) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_AMOUNT',
          message: 'Amount must be at least ₦1.00 (100 kobo)'
        }
      });
    }

    if (!customerEmail) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_EMAIL',
          message: 'Customer email is required for Paystack payments'
        }
      });
    }

    if (!Paystack.isConfigured && !secretKey) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'PAYSTACK_NOT_CONFIGURED',
          message: 'Paystack is not properly configured'
        }
      });
    }

    // Generate reference
    const reference = `TEST_${Date.now()}`;
    
    // Initialize Paystack transaction
    const transactionData = {
      email: customerEmail,
      amount: amount * 100, // Convert to kobo
      reference: reference,
      callback_url: redirectUrl || 'https://example.com/success',
      metadata: {
        description: description || 'Test payment',
        test: true
      }
    };

    console.log('📦 Paystack transaction data:', transactionData);

    const result = await paystack.transaction.initialize(transactionData);
    console.log('✅ Paystack response:', result);

    if (result.status) {
      return res.status(200).json({
        success: true,
        data: {
          reference: result.data.reference,
          status: 'pending',
          amount: amount,
          currency: 'NGN',
          redirectUrl: result.data.authorization_url,
          gateway: 'paystack',
          accessCode: result.data.access_code,
          createdAt: new Date().toISOString()
        }
      });
    } else {
      return res.status(400).json({
        success: false,
        error: {
          code: 'PAYSTACK_ERROR',
          message: result.message || 'Paystack payment failed'
        }
      });
    }

  } catch (error) {
    console.error('❌ Paystack error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Paystack payment processing failed: ' + error.message
      }
    });
  }
});

// Verification endpoint
app.get('/api/paystack-verify/:reference', async (req, res) => {
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

    const result = await paystack.transaction.verify(reference);
    
    if (result.status) {
      return res.status(200).json({
        success: true,
        data: {
          reference,
          status: result.data.status,
          amount: result.data.amount / 100, // Convert from kobo
          currency: result.data.currency,
          paidAt: result.data.paid_at,
          gatewayResponse: result.data.gateway_response
        }
      });
    } else {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VERIFICATION_FAILED',
          message: result.message || 'Payment verification failed'
        }
      });
    }

  } catch (error) {
    console.error('❌ Verification error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to verify Paystack payment'
      }
    });
  }
});

// Health check
app.get('/api/health-clean', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'LedgerFlow API Running',
      paystack: secretKey ? 'Configured' : 'Not Configured',
      environment: secretKey?.startsWith('sk_test_') ? 'Test Mode' : 'Live Mode'
    }
  });
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`🚀 Clean Paystack Test Server running on port ${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/api/health-clean`);
  console.log(`🏦 Payment: POST http://localhost:${PORT}/api/paystack-test`);
  console.log(`🔍 Verify: GET http://localhost:${PORT}/api/paystack-verify/:reference`);
  console.log(`\n🎯 Test with Postman using these endpoints!`);
});
