const fs = require('fs');
const path = require('path');

// Migration directory
const MIGRATIONS_DIR = path.join(__dirname, '../../migrations');

// Generate timestamp for migration filename
function generateTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

// Create migration file
function createMigration(name) {
  // Validate name
  if (!name) {
    console.error('✗ Please provide a migration name');
    console.log('Usage: npm run migrate:create <migration-name>');
    process.exit(1);
  }
  
  // Ensure migrations directory exists
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    fs.mkdirSync(MIGRATIONS_DIR, { recursive: true });
  }
  
  // Generate filename
  const timestamp = generateTimestamp();
  const sanitizedName = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  
  const filename = `${timestamp}_${sanitizedName}.sql`;
  const filepath = path.join(MIGRATIONS_DIR, filename);
  
  // Check if file already exists
  if (fs.existsSync(filepath)) {
    console.error(`✗ Migration file already exists: ${filename}`);
    process.exit(1);
  }
  
  // Migration template
  const template = `-- Migration: ${name}
-- Created: ${new Date().toISOString()}
-- Description: Add your migration description here

-- Up Migration
-- Add your schema changes here

-- Example:
-- CREATE TABLE IF NOT EXISTS example_table (
--     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--     name VARCHAR(255) NOT NULL,
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
-- );

-- Down Migration (optional - for rollback)
-- Add rollback SQL here (commented out by default)
-- DROP TABLE IF EXISTS example_table;
`;
  
  // Write migration file
  try {
    fs.writeFileSync(filepath, template);
    console.log(`✓ Created migration: ${filename}`);
    console.log(`  Path: ${filepath}`);
    console.log('\nNext steps:');
    console.log('1. Edit the migration file to add your schema changes');
    console.log('2. Run "npm run migrate" to apply the migration');
  } catch (error) {
    console.error('✗ Failed to create migration:', error.message);
    process.exit(1);
  }
}

// Get migration name from command line arguments
const args = process.argv.slice(2);
const migrationName = args.join('_');

if (!migrationName) {
  console.error('✗ Please provide a migration name');
  console.log('\nUsage:');
  console.log('  npm run migrate:create <migration-name>');
  console.log('\nExamples:');
  console.log('  npm run migrate:create add_commissions_table');
  console.log('  npm run migrate:create update_users_add_phone');
  console.log('  npm run migrate:create "add commission tracking"');
  process.exit(1);
}

// Create the migration
createMigration(migrationName);