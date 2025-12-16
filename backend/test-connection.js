const { Pool } = require('pg');

// Direct test without dotenv
const connectionString = 'postgresql://neondb_owner:npg_ADKHytS89QTi@ep-dark-mud-a18wdqlk-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

console.log('Testing direct connection to Neon...');
console.log('Connection string (masked):', connectionString.replace(/:[^:@]*@/, ':***@'));

const pool = new Pool({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }
});

async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('✅ Connection successful!');
    console.log('Current time:', result.rows[0].current_time);
    console.log('PostgreSQL version:', result.rows[0].pg_version);
    
    // Test creating a simple table
    await pool.query('CREATE TABLE IF NOT EXISTS test_table (id SERIAL PRIMARY KEY, name TEXT)');
    console.log('✅ Table creation test successful!');
    
    await pool.query('DROP TABLE IF EXISTS test_table');
    console.log('✅ Table cleanup successful!');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  } finally {
    await pool.end();
  }
}

testConnection();