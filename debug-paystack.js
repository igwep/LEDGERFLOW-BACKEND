// Debug Paystack API response
require('dotenv').config();
const Paystack = require('paystack');

const paystack = Paystack(process.env.PAYSTACK_SECRET_KEY);

async function testPaystackAPI() {
  try {
    console.log('🔑 Testing Paystack API...');
    console.log('Secret Key:', process.env.PAYSTACK_SECRET_KEY?.substring(0, 10) + '...');
    
    // Test basic transaction initialization
    const transactionData = {
      email: 'test@example.com',
      amount: 5000, // 5000 kobo = ₦50.00
      reference: `TEST_${Date.now()}`,
      callback_url: 'https://example.com/success'
    };
    
    console.log('📦 Sending data:', transactionData);
    
    const result = await paystack.transaction.initialize(transactionData);
    
    console.log('✅ Paystack Response:');
    console.log('Status:', result.status);
    console.log('Message:', result.message);
    console.log('Data:', result.data);
    console.log('Full Response:', JSON.stringify(result, null, 2));
    
    if (result.data && result.data.reference) {
      console.log('🎉 SUCCESS! Reference:', result.data.reference);
    } else {
      console.log('❌ ERROR: No reference in response');
    }
    
  } catch (error) {
    console.error('❌ Paystack Error:', error);
    console.error('Error details:', error.message);
    console.error('Full error:', JSON.stringify(error, null, 2));
  }
}

testPaystackAPI();
