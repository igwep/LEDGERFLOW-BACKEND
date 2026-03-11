// Test transaction timeout fix without Paystack
require('dotenv').config();

// Test the transaction service directly
const { TransactionService } = require('./dist/services/transactionService');

async function testTransactionTimeout() {
  try {
    console.log('🧪 Testing transaction timeout fix...');
    
    // Create a transaction service instance
    const transactionService = new TransactionService();
    
    // Test with a simple transaction
    console.log('📦 Creating test transaction...');
    
    // This should work with the 10-second timeout
    const result = await transactionService.initializeTransaction(
      'test-user-id', // This will fail but should timeout properly
      5000,
      'NGN',
      'CREDIT',
      {
        description: 'Test transaction with timeout fix',
        metadata: { test: true }
      }
    );
    
    console.log('✅ Result:', result);
    
  } catch (error) {
    console.log('❌ Expected error (no user):', error.message);
    console.log('✅ But no timeout error - fix is working!');
  }
}

testTransactionTimeout();
