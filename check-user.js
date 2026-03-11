require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    });
    
    console.log('User ID:', user?.id);
    console.log('User ID type:', typeof user?.id);
    console.log('User:', user);
    
    const wallet = await prisma.wallet.findUnique({
      where: { userId: user?.id }
    });
    
    console.log('Wallet:', wallet);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
