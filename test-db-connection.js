const { Client } = require('pg');

const connectionString = 'postgresql://postgres:password@localhost:5432/ledgerflow_db';
console.log('Debug - Connection string:', connectionString);

const client = new Client({
  connectionString: connectionString
});

async function testConnection() {
  try {
    console.log('Testing PostgreSQL connection...');
    console.log('Client connection string:', client.connectionString);
    
    await client.connect();
    console.log('✅ Connected successfully!');
    
    const result = await client.query('SELECT version()');
    console.log('Database version:', result.rows[0].version);
    
    await client.end();
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Error details:', error);
  }
}

testConnection();
