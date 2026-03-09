"use strict";
// Import PrismaClient dynamically
const { PrismaClient: SetupPrismaClient } = require('@prisma/client');
const setupPrisma = new SetupPrismaClient();
// Simple database access without requiring .env setup
async function quickDatabaseAccess() {
    console.log('🔍 LedgerFlow Database Access Setup');
    console.log('=====================================\n');
    // Check if DATABASE_URL is set
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        console.log('❌ DATABASE_URL not found in environment variables\n');
        console.log('🔧 To set up database access:');
        console.log('1. Copy env-example.txt to .env');
        console.log('2. Edit .env with your database credentials');
        console.log('3. Run: npm run db:test\n');
        console.log('📋 Example DATABASE_URL formats:');
        console.log('  PostgreSQL: postgresql://user:password@localhost:5432/dbname');
        console.log('  MySQL: mysql://user:password@localhost:3306/dbname');
        console.log('  SQLite: file:./dev.db\n');
        console.log('🚀 Quick setup commands:');
        console.log('  cp env-example.txt .env');
        console.log('  # Edit .env file with your database info');
        console.log('  npm run db:generate');
        console.log('  npm run db:push');
        console.log('  npm run db:test');
        return;
    }
    // If DATABASE_URL is set, try to connect
    console.log('✅ DATABASE_URL found, attempting connection...\n');
    const setupPrisma = new SetupPrismaClient();
    try {
        await setupPrisma.$connect();
        console.log('🎉 Database connected successfully!\n');
        // Show available models
        console.log('📊 Available Database Models:');
        const models = [
            'User', 'Wallet', 'Transaction', 'LedgerEntry',
            'Withdrawal', 'FraudScore', 'WebhookEvent'
        ];
        models.forEach(model => {
            console.log(`  ✅ ${model}`);
        });
        console.log('\n🔧 Available Commands:');
        console.log('  npm run db:studio    - Open database in browser');
        console.log('  npm run db:test      - Test connection & view data');
        console.log('  npm run db:push      - Push schema changes');
        console.log('  npm run db:generate  - Generate Prisma client');
        console.log('  npm run db:reset     - Reset database (WARNING: deletes data)');
    }
    catch (error) {
        console.error('❌ Database connection failed:', error instanceof Error ? error.message : String(error));
        console.log('\n🔧 Troubleshooting:');
        console.log('1. Check if database server is running');
        console.log('2. Verify DATABASE_URL is correct');
        console.log('3. Ensure database exists');
        console.log('4. Check user permissions');
    }
    finally {
        await setupPrisma.$disconnect();
    }
}
quickDatabaseAccess();
//# sourceMappingURL=setupDatabase.js.map