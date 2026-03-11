// Direct test of Paystack service without full API routes
const { PaystackService } = require('./dist/services/paystackService');

async function testPaystackService() {
  console.log('🧪 Testing Paystack Service Directly...\n');

  try {
    // Test 1: Check if Paystack is configured
    console.log('1. Checking Paystack configuration...');
    const isConfigured = PaystackService.isConfigured();
    console.log(`✅ Paystack configured: ${isConfigured}`);

    if (!isConfigured) {
      console.log('⚠️  Paystack not configured. Using demo mode.');
    }

    // Test 2: Get environment info
    console.log('\n2. Getting Paystack environment info...');
    const envInfo = PaystackService.getEnvironmentInfo();
    console.log('✅ Environment info:', envInfo);

    // Test 3: Create a payment request
    console.log('\n3. Creating a payment request...');
    const paymentRequest = PaystackService.createPaymentRequest(
      {
        amount: 5000,
        description: 'Test payment',
        customerEmail: 'test@example.com',
        redirectUrl: 'https://example.com/success'
      },
      'test@example.com',
      'TEST_REF_123',
      'https://example.com/success'
    );
    console.log('✅ Payment request created:', paymentRequest);

    // Test 4: Process webhook (mock)
    console.log('\n4. Testing webhook processing...');
    const webhookPayload = {
      event: 'charge.success',
      data: {
        id: 123456,
        reference: 'TEST_REF_123',
        amount: 500000,
        currency: 'NGN',
        status: 'success',
        customer: {
          email: 'test@example.com'
        }
      }
    };

    const webhookResult = PaystackService.processWebhook(webhookPayload);
    console.log('✅ Webhook processed:', webhookResult);

    console.log('\n🎉 Paystack service tests completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Add real Paystack test keys to .env');
    console.log('2. Test actual transaction initialization');
    console.log('3. Test payment verification');

  } catch (error) {
    console.error('❌ Direct test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testPaystackService();
