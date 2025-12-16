const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Database setup script for Neon.tech
async function setupDatabase() {
  console.log('🚀 Setting up Trade-X database on Neon.tech...');
  
  // Use the connection string directly (since dotenv seems to have issues)
  const connectionString = 'postgresql://neondb_owner:npg_ADKHytS89QTi@ep-dark-mud-a18wdqlk-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
  
  console.log('🔍 Using connection string (masked):', connectionString.replace(/:[^:@]*@/, ':***@'));

  const pool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    // Test connection
    console.log('🔌 Testing database connection...');
    await pool.query('SELECT NOW()');
    console.log('✅ Connected to Neon database successfully!');

    // Read and execute schema
    console.log('📋 Creating database schema...');
    const schemaSQL = fs.readFileSync(path.join(__dirname, 'database', 'schema.sql'), 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = schemaSQL.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const statement of statements) {
      if (statement.trim()) {
        await pool.query(statement);
      }
    }

    console.log('✅ Database schema created successfully!');
    console.log('🎉 Setup complete! Your backend is ready to use.');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupDatabase().catch(console.error);