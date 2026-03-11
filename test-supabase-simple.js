// Simple Supabase connection test
require('dotenv').config();

const { PrismaClient } = require('@prisma/client');

async function testSupabaseSimple() {
  try {
    console.log('🔍 Testing Supabase connection...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 50) + '...');
    
    const prisma = new PrismaClient();
    
    // Simple connection test
    console.log('📦 Connecting to database...');
    
    // Try to run a simple query that works in PostgreSQL
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    
    console.log('✅ Connected successfully!');
    console.log('📊 Test query result:', result);
    
    await prisma.$disconnect();
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

testSupabaseSimple();
