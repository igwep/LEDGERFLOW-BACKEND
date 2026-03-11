// Create wallet for existing user
require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createWalletForUser() {
  try {
    console.log('🔍 Looking for user...');
    
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ User found:', user.email, user.id);
    
    // Check if wallet already exists
    const existingWallet = await prisma.wallet.findUnique({
      where: { userId: user.id }
    });
    
    if (existingWallet) {
      console.log('✅ Wallet already exists');
      return;
    }
    
    // Create wallet
    const wallet = await prisma.wallet.create({
      data: {
        userId: user.id,
        balance: 0,
        available: 0,
        lockedBalance: 0,
        currency: 'NGN',
        status: 'ACTIVE'
      }
    });
    
    console.log('✅ Wallet created:', wallet.id);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createWalletForUser();
