// Test Supabase PostgreSQL connection
require('dotenv').config();

const { PrismaClient } = require('@prisma/client');

async function testSupabaseConnection() {
  try {
    console.log('🔍 Testing Supabase connection...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 50) + '...');
    
    const prisma = new PrismaClient();
    
    // Simple connection test
    console.log('📦 Connecting to database...');
    
    // Try to run a simple query
    const result = await prisma.$queryRaw`SELECT version()`;
    
    console.log('✅ Connected successfully!');
    console.log('📊 Database version:', result);
    
    await prisma.$disconnect();
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('🔍 Error details:', error);
    
    // Try different connection formats
    console.log('\n🔄 Trying alternative connection formats...');
    
    const alternatives = [
      'postgresql://postgres:LChTwHPYSTcGlxr5@db.nxdgiowicsjhchgozsem.supabase.co:5432/postgres',
      'postgresql://postgres:LChTwHPYSTcGlxr5@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres',
      'postgres://postgres:LChTwHPYSTcGlxr5@db.nxdgiowicsjhchgozsem.supabase.co:5432/postgres'
    ];
    
    for (const altUrl of alternatives) {
      try {
        console.log(`🔍 Trying: ${altUrl.substring(0, 50)}...`);
        
        const prismaAlt = new PrismaClient({
          datasources: {
            db: {
              url: altUrl
            }
          }
        });
        
        await prismaAlt.$queryRaw`SELECT 1`;
        console.log(`✅ Alternative connection works: ${altUrl.substring(0, 50)}...`);
        
        await prismaAlt.$disconnect();
        break;
        
      } catch (altError) {
        console.log(`❌ Failed: ${altError.message}`);
      }
    }
  }
}

testSupabaseConnection();
