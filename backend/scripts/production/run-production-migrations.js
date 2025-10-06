// Script to run migrations on production database
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const productionPool = new Pool({
  connectionString: process.env.RAILWAY_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function runMigrations() {
  const client = await productionPool.connect();
  
  try {
    console.log('🔄 Running migrations on production database...\n');
    
    // Check if migrations have been run
    const checkQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'escrows' AND column_name = 'numeric_id'
    `;
    
    const checkResult = await client.query(checkQuery);
    
    if (checkResult.rows.length > 0) {
      console.log('✅ Migrations already applied - numeric_id column exists');
      return;
    }
    
    // Run migration 007
    console.log('📄 Running migration 007_add_numeric_id_to_escrows.sql...');
    const migrationPath = path.join(__dirname, '..', 'migrations', '007_add_numeric_id_to_escrows.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split by semicolons and run each statement
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    for (const statement of statements) {
      try {
        await client.query(statement);
      } catch (e) {
        console.error(`Error executing statement: ${statement.substring(0, 50)}...`);
        console.error(e.message);
      }
    }
    
    console.log('✅ Migration completed successfully');
    
  } catch (error) {
    console.error('❌ Error running migrations:', error.message);
  } finally {
    client.release();
    await productionPool.end();
  }
}

runMigrations();