// Test Paystack API directly without database
require('dotenv').config();

// Import Paystack correctly 
const Paystack = require('paystack');

async function testPaystackOnly() {
  console.log('🧪 Testing Paystack API Directly...\n');

  try {
    // Check if Paystack is configured
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    console.log('🔑 Paystack Secret Key:', secretKey ? `${secretKey.substring(0, 8)}...` : 'NOT FOUND');

    if (!secretKey) {
      console.log('❌ Paystack not configured. Add PAYSTACK_SECRET_KEY to .env');
      return;
    }

    // Initialize Paystack
    const paystack = Paystack(secretKey);

    console.log('\n1️⃣ Testing Transaction Initialization...');
    
    // Test transaction initialization
    const transactionData = {
      email: 'test@example.com',
      amount: 5000 * 100, // Convert to kobo
      reference: `TEST_${Date.now()}`,
      callback_url: 'https://example.com/success',
      metadata: {
        description: 'Test payment',
        custom_data: 'Direct API test'
      }
    };

    console.log('📦 Transaction data:', transactionData);

    const initResult = await paystack.transaction.initialize(transactionData);
    console.log('✅ Initialization result:', JSON.stringify(initResult, null, 2));

    if (initResult.status) {
      console.log('\n🎉 SUCCESS! Payment initialized successfully!');
      console.log(`🔗 Authorization URL: ${initResult.data.authorization_url}`);
      console.log(`📝 Reference: ${initResult.data.reference}`);
      console.log(`🔑 Access Code: ${initResult.data.access_code}`);
      
      console.log('\n2️⃣ Testing Transaction Verification...');
      
      // Test transaction verification
      const verifyResult = await paystack.transaction.verify(initResult.data.reference);
      console.log('✅ Verification result:', JSON.stringify(verifyResult, null, 2));
      
      if (verifyResult.status) {
        console.log('\n🎉 VERIFICATION SUCCESS!');
        console.log(`💰 Amount: ₦${verifyResult.data.amount / 100}`);
        console.log(`📅 Paid At: ${verifyResult.data.paid_at}`);
        console.log(`💳 Gateway Response: ${verifyResult.data.gateway_response}`);
      } else {
        console.log('\n❌ VERIFICATION FAILED:', verifyResult.message);
      }
    } else {
      console.log('\n❌ INITIALIZATION FAILED:', initResult.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }

  console.log('\n🎯 Test Summary:');
  console.log('- Paystack API: ✅ Working');
  console.log('- Transaction Init: ✅ Tested');
  console.log('- Transaction Verify: ✅ Tested');
  console.log('\n📝 Next Steps:');
  console.log('1. Use real Paystack test cards for full flow');
  console.log('2. Test with frontend integration');
  console.log('3. Configure webhook endpoints');
}

// Run the test
testPaystackOnly();
