const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function checkEnv() {
  console.log('🔍 Checking production environment...\n');
  
  console.log('Environment Variables:');
  console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');
  console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET (' + process.env.JWT_SECRET.substring(0, 10) + '...)' : 'NOT SET');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
  console.log('RAILWAY_DATABASE_URL:', process.env.RAILWAY_DATABASE_URL ? 'SET' : 'NOT SET');
  
  // Test database connection
  const pool = new Pool({
    connectionString: process.env.RAILWAY_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    const result = await pool.query('SELECT COUNT(*) FROM users');
    console.log('\n✅ Database connection successful');
    console.log('User count:', result.rows[0].count);
  } catch (error) {
    console.log('\n❌ Database connection failed:', error.message);
  } finally {
    await pool.end();
  }
}

checkEnv();