import { PrismaClient } from '@prisma/client';

async function testDatabase() {
  console.log('🔍 Testing SQLite Database Connection...');
  
  const prisma = new PrismaClient({
    adapter: {
      name: 'sqlite',
      options: {
        connectionString: 'file:./dev.db'
      }
    }
  });
  
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully!');
    
    // Test basic query
    const userCount = await prisma.user.count();
    console.log(`👥 Users: ${userCount}`);
    
    const walletCount = await prisma.wallet.count();
    console.log(`💳 Wallets: ${walletCount}`);
    
    const transactionCount = await prisma.transaction.count();
    console.log(`💸 Transactions: ${transactionCount}`);
    
    console.log('\n🎉 Database is ready for use!');
    
  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
