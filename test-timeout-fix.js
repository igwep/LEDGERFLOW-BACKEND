// Test if timeout fix is working
require('dotenv').config();

const { TransactionService } = require('./dist/services/transactionService');

async function testTimeoutFix() {
  try {
    console.log('🧪 Testing timeout fix...');
    
    const transactionService = new TransactionService();
    
    // Test with a very simple transaction that should timeout quickly if not fixed
    const startTime = Date.now();
    
    try {
      const result = await transactionService.initializeTransaction(
        'invalid-user-id', // This will fail but should not timeout
        1000,
        'NGN',
        'CREDIT',
        {
          description: 'Timeout test'
        }
      );
      
      console.log('✅ Result:', result);
      
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log('❌ Error:', error.message);
      console.log('⏱️ Duration:', duration + 'ms');
      
      if (duration < 8000) {
        console.log('✅ Timeout fix working! Failed quickly as expected.');
      } else {
        console.log('❌ Timeout issue persists - took too long to fail');
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testTimeoutFix();
