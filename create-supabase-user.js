// Create test user in Supabase
require('dotenv').config();

const { PrismaClient } = require('@prisma/client');

async function createSupabaseUser() {
  try {
    console.log('🔍 Creating test user in Supabase...');
    
    const prisma = new PrismaClient();
    
    // Create test user
    const user = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        id: '991ac1ce-bcda-4f56-ad0e-660a2c487eb6',
        email: 'test@example.com',
        name: 'Test User',
        paymentEndpoint: 'pay_testuser_ooz',
        status: 'ACTIVE'
      }
    });
    
    console.log('✅ User created:', user);
    
    // Create wallet
    const wallet = await prisma.wallet.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        id: `wallet-${user.id}`,
        userId: user.id,
        balance: 0,
        available: 0,
        lockedBalance: 0,
        currency: 'NGN',
        status: 'ACTIVE'
      }
    });
    
    console.log('✅ Wallet created:', wallet);
    
    await prisma.$disconnect();
    
  } catch (error) {
    console.error('❌ Error creating user:', error.message);
  }
}

createSupabaseUser();
