// Quick test script for Paystack integration
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testPaystack() {
  console.log('🧪 Testing Paystack Integration...\n');

  try {
    // Step 1: Test health check
    console.log('1. Testing health check...');
    const health = await axios.get(`${API_BASE}/health`);
    console.log('✅ Health check:', health.data);

    // Step 2: Test Paystack payment endpoint (without actual Paystack keys)
    console.log('\n2. Testing Paystack payment endpoint...');
    try {
      const paymentResponse = await axios.post(`${API_BASE}/payments/test_endpoint/paystack`, {
        amount: 5000,
        description: 'Test payment',
        customerEmail: 'test@example.com',
        redirectUrl: 'https://example.com/success'
      });
      console.log('✅ Payment response:', paymentResponse.data);
    } catch (paymentError) {
      console.log('⚠️  Payment test (expected without Paystack keys):', paymentError.response?.data || paymentError.message);
    }

    // Step 3: Test Paystack verification endpoint
    console.log('\n3. Testing Paystack verification endpoint...');
    try {
      const verifyResponse = await axios.get(`${API_BASE}/payments/verify/test_ref/paystack`);
      console.log('✅ Verification response:', verifyResponse.data);
    } catch (verifyError) {
      console.log('⚠️  Verification test (expected without Paystack keys):', verifyError.response?.data || verifyError.message);
    }

    // Step 4: Test Paystack webhook endpoint
    console.log('\n4. Testing Paystack webhook endpoint...');
    try {
      const webhookResponse = await axios.post(`${API_BASE}/webhooks/paystack`, {
        event: 'charge.success',
        data: {
          id: 123456,
          reference: 'test_ref_123',
          amount: 500000,
          currency: 'NGN',
          status: 'success',
          customer: {
            email: 'test@example.com'
          }
        }
      });
      console.log('✅ Webhook response:', webhookResponse.data);
    } catch (webhookError) {
      console.log('❌ Webhook test failed:', webhookError.response?.data || webhookError.message);
    }

    console.log('\n🎉 Paystack integration tests completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Add your Paystack test keys to .env file');
    console.log('2. Restart the server');
    console.log('3. Test with real Paystack transactions');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testPaystack();
