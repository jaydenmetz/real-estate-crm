// Script to ensure both local and production databases have the same structure
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Database connections
const localPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

const productionPool = new Pool({
  connectionString: process.env.RAILWAY_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function runMigrationOnDatabase(pool, migrationFile, dbName) {
  const client = await pool.connect();
  
  try {
    console.log(`\n📄 Running ${migrationFile} on ${dbName}...`);
    
    const migrationPath = path.join(__dirname, '..', 'migrations', migrationFile);
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split by semicolons and run each statement
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const statement of statements) {
      try {
        await client.query(statement);
        successCount++;
      } catch (e) {
        if (e.code === '42P07') { // "relation already exists"
          console.log(`  ⚠️  Table/index already exists, skipping`);
        } else if (e.code === '42701') { // "column already exists"
          console.log(`  ⚠️  Column already exists, skipping`);
        } else if (e.code === '42P01') { // "relation does not exist"
          console.log(`  ⚠️  Table doesn't exist to drop, skipping`);
        } else {
          console.error(`  ❌ Error: ${e.message}`);
          errorCount++;
        }
      }
    }
    
    console.log(`  ✅ Completed: ${successCount} statements succeeded`);
    if (errorCount > 0) {
      console.log(`  ⚠️  ${errorCount} statements had errors`);
    }
    
  } catch (error) {
    console.error(`❌ Error running migration on ${dbName}:`, error.message);
  } finally {
    client.release();
  }
}

async function syncDatabases() {
  try {
    console.log('🔄 Syncing database structures...\n');
    
    // List of migrations to run
    const migrations = [
      '007_add_numeric_id_to_escrows.sql',
      '008_create_escrow_people_table.sql'
    ];
    
    // Run migrations on both databases
    for (const migration of migrations) {
      await runMigrationOnDatabase(localPool, migration, 'LOCAL');
      await runMigrationOnDatabase(productionPool, migration, 'PRODUCTION');
    }
    
    console.log('\n✅ Database structure sync completed');
    
    // Clear and seed data
    console.log('\n🗑️  Clearing existing data...');
    
    // Clear local
    const localClient = await localPool.connect();
    try {
      await localClient.query('DELETE FROM escrow_checklists');
      await localClient.query('DELETE FROM escrow_people');
      await localClient.query('DELETE FROM escrows');
      console.log('  ✓ Local database cleared');
    } finally {
      localClient.release();
    }
    
    // Clear production
    const prodClient = await productionPool.connect();
    try {
      await prodClient.query('DELETE FROM escrow_checklists WHERE 1=1'); // WHERE 1=1 to avoid trigger issues
      await prodClient.query('DELETE FROM escrow_people WHERE 1=1');
      await prodClient.query('DELETE FROM escrows WHERE 1=1');
      console.log('  ✓ Production database cleared');
    } finally {
      prodClient.release();
    }
    
    // Now seed the data
    console.log('\n🌱 Seeding identical data...');
    const seedScript = require('./seed-simple-data.js');
    
  } catch (error) {
    console.error('❌ Failed to sync databases:', error);
  } finally {
    await localPool.end();
    await productionPool.end();
  }
}

// Run the sync
syncDatabases();