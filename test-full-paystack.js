// Test full Paystack integration with new keys
require('dotenv').config();

const { PaystackService } = require('./dist/services/paystackService');

async function testFullPaystackIntegration() {
  try {
    console.log('🧪 Testing full Paystack integration...');
    
    // Test 1: Direct API call
    console.log('📦 1. Testing direct Paystack API...');
    const initResult = await PaystackService.initializeTransaction({
      email: 'test@example.com',
      amount: 5000,
      reference: `TEST_${Date.now()}`,
      callback_url: 'https://example.com/success'
    });
    
    console.log('✅ Direct API Result:', initResult);
    
    if (initResult.status && initResult.data?.reference) {
      console.log('🎉 SUCCESS! Reference:', initResult.data.reference);
      console.log('🔗 Authorization URL:', initResult.data.authorization_url);
      
      // Test 2: Verification
      console.log('\n📦 2. Testing transaction verification...');
      const verifyResult = await PaystackService.verifyTransaction(initResult.data.reference);
      console.log('✅ Verification Result:', verifyResult);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testFullPaystackIntegration();
