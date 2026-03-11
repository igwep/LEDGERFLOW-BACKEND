// Test if Paystack keys are properly loaded
require('dotenv').config();

console.log('🔑 Checking Paystack Configuration...\n');

const secretKey = process.env.PAYSTACK_SECRET_KEY;
const publicKey = process.env.PAYSTACK_PUBLIC_KEY;

console.log('Secret Key:', secretKey ? `${secretKey.substring(0, 8)}...` : 'NOT FOUND');
console.log('Public Key:', publicKey ? `${publicKey.substring(0, 8)}...` : 'NOT FOUND');

if (secretKey) {
  const isTest = secretKey.startsWith('sk_test_');
  console.log('Mode:', isTest ? 'TEST (Development)' : 'LIVE (Production)');
  
  if (isTest) {
    console.log('✅ Ready for testing with sandbox mode!');
  } else {
    console.log('⚠️  LIVE mode detected - real transactions will be processed!');
  }
} else {
  console.log('❌ Paystack not configured - add keys to .env file');
}

console.log('\n📝 Next steps:');
console.log('1. Add your Paystack keys to .env file');
console.log('2. Restart the server: npm start');
console.log('3. Test with: node test-paystack-direct.js');
