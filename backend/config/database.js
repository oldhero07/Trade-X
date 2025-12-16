const { Pool } = require('pg');

// Use the Neon connection string directly
const connectionString = 'postgresql://neondb_owner:npg_ADKHytS89QTi@ep-dark-mud-a18wdqlk-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

const pool = new Pool({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }
});

// Test connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to database:', err.stack);
  } else {
    console.log('Connected to PostgreSQL database');
    release();
  }
});

module.exports = pool;