import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDatabaseConnection() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully!');

    // Get database info
    const userCount = await prisma.user.count();
    const walletCount = await prisma.wallet.count();
    const transactionCount = await prisma.transaction.count();

    console.log('\n📊 Database Statistics:');
    console.log(`  Users: ${userCount}`);
    console.log(`  Wallets: ${walletCount}`);
    console.log(`  Transactions: ${transactionCount}`);

    // Show sample data if exists
    if (userCount > 0) {
      const users = await prisma.user.findMany({
        take: 3,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      });
      
      console.log('\n👥 Sample Users:');
      users.forEach((user: any) => {
        console.log(`  ID: ${user.id}`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Name: ${user.name || 'N/A'}`);
        console.log(`  Role: ${user.role}`);
        console.log(`  Created: ${user.createdAt}`);
        console.log('  ---');
      });
    }

    if (walletCount > 0) {
      const wallets = await prisma.wallet.findMany({
        take: 3,
        include: {
          user: {
            select: {
              email: true,
              name: true,
            },
          },
        },
      });
      
      console.log('\n💳 Sample Wallets:');
      wallets.forEach((wallet: any) => {
        console.log(`  ID: ${wallet.id}`);
        console.log(`  User: ${wallet.user.name || 'N/A'} (${wallet.user.email})`);
        console.log(`  Balance: ${wallet.balance} ${wallet.currency}`);
        console.log(`  Available: ${wallet.available} ${wallet.currency}`);
        console.log(`  Locked: ${wallet.lockedBalance} ${wallet.currency}`);
        console.log(`  Status: ${wallet.status}`);
        console.log('  ---');
      });
    }

    if (transactionCount > 0) {
      const transactions = await prisma.transaction.findMany({
        take: 3,
        include: {
          user: {
            select: {
              email: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      
      console.log('\n💸 Recent Transactions:');
      transactions.forEach((tx: any) => {
        console.log(`  ID: ${tx.id}`);
        console.log(`  Reference: ${tx.reference}`);
        console.log(`  User: ${tx.user.name || 'N/A'} (${tx.user.email})`);
        console.log(`  Amount: ${tx.amount} ${tx.currency}`);
        console.log(`  Type: ${tx.type}`);
        console.log(`  Status: ${tx.status}`);
        console.log(`  Created: ${tx.createdAt}`);
        console.log('  ---');
      });
    }

  } catch (error) {
    console.error('❌ Database connection failed:', error instanceof Error ? error.message : String(error));
    console.log('\n🔧 To fix this:');
    console.log('1. Make sure PostgreSQL is running');
    console.log('2. Set DATABASE_URL in your .env file');
    console.log('3. Run: npx prisma db push');
    console.log('4. Run: npx prisma studio to view data');
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testDatabaseConnection();
