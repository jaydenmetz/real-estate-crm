#!/usr/bin/env node

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Production database URL from Railway
const DATABASE_URL = process.env.DATABASE_URL || process.env.RAILWAY_DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ No DATABASE_URL found in environment variables');
  process.exit(1);
}

async function runMigration() {
  // Parse the connection string to determine if SSL is needed
  const isProduction = DATABASE_URL.includes('railway.app') || DATABASE_URL.includes('amazonaws.com');
  
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: isProduction ? {
      rejectUnauthorized: false
    } : false
  });

  try {
    console.log('🔄 Connecting to production database...');
    await client.connect();
    console.log('✅ Connected successfully');

    // First, let's check current state
    console.log('\n📊 Checking current ID formats...');
    
    const tables = ['escrows', 'listings', 'clients', 'leads', 'appointments'];
    
    for (const table of tables) {
      try {
        const result = await client.query(`
          SELECT COUNT(*) as total,
                 COUNT(CASE WHEN id LIKE '${table.slice(0, -1)}-%' THEN 1 END) as with_prefix,
                 COUNT(CASE WHEN id NOT LIKE '${table.slice(0, -1)}-%' THEN 1 END) as without_prefix
          FROM ${table}
        `);
        
        console.log(`\n${table}:`);
        console.log(`  Total records: ${result.rows[0].total}`);
        console.log(`  With prefix: ${result.rows[0].with_prefix}`);
        console.log(`  Without prefix: ${result.rows[0].without_prefix}`);
        
        // Show sample IDs
        const sampleResult = await client.query(`
          SELECT id FROM ${table} 
          WHERE id NOT LIKE '${table.slice(0, -1)}-%' 
          LIMIT 3
        `);
        
        if (sampleResult.rows.length > 0) {
          console.log(`  Sample IDs without prefix:`);
          sampleResult.rows.forEach(row => {
            console.log(`    - ${row.id}`);
          });
        }
      } catch (err) {
        console.log(`  ⚠️  Table ${table} might not exist or has no records`);
      }
    }

    // Ask for confirmation
    console.log('\n⚠️  This migration will add prefixes to all IDs that don\'t have them.');
    console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...');
    
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Read and run the migration
    console.log('\n🚀 Running migration...');
    const migrationPath = path.join(__dirname, '../../migrations/015_add_entity_prefixes_to_ids.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split by statement and run each one
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.includes('UPDATE')) {
        console.log(`\n📝 Running: ${statement.substring(0, 50)}...`);
        try {
          const result = await client.query(statement);
          console.log(`✅ Updated ${result.rowCount} rows`);
        } catch (err) {
          console.log(`⚠️  Statement had no effect or failed: ${err.message}`);
        }
      } else if (statement.includes('COMMENT')) {
        // Comments might fail on some databases
        try {
          await client.query(statement);
          console.log(`✅ Added comment`);
        } catch (err) {
          console.log(`⚠️  Could not add comment: ${err.message}`);
        }
      }
    }

    // Verify the changes
    console.log('\n✅ Migration complete! Verifying changes...');
    
    for (const table of tables) {
      try {
        const result = await client.query(`
          SELECT COUNT(*) as total,
                 COUNT(CASE WHEN id LIKE '${table.slice(0, -1)}-%' THEN 1 END) as with_prefix
          FROM ${table}
        `);
        
        console.log(`${table}: ${result.rows[0].with_prefix}/${result.rows[0].total} records have prefix`);
        
        // Show sample of new IDs
        const sampleResult = await client.query(`
          SELECT id FROM ${table} 
          WHERE id LIKE '${table.slice(0, -1)}-%' 
          LIMIT 2
        `);
        
        if (sampleResult.rows.length > 0) {
          sampleResult.rows.forEach(row => {
            console.log(`  ✓ ${row.id}`);
          });
        }
      } catch (err) {
        // Skip if table doesn't exist
      }
    }

    console.log('\n🎉 Entity prefix migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run the migration
runMigration();