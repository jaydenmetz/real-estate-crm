const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

// Create a new pool for migration operations
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

// Migration directory
const MIGRATIONS_DIR = path.join(__dirname, '../../migrations');

// Create migrations table if it doesn't exist
async function createMigrationsTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) UNIQUE NOT NULL,
      executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
  try {
    await pool.query(createTableQuery);
    console.log('✓ Migrations table ready');
  } catch (error) {
    console.error('✗ Failed to create migrations table:', error.message);
    throw error;
  }
}

// Get list of executed migrations
async function getExecutedMigrations() {
  const query = 'SELECT filename FROM migrations ORDER BY executed_at';
  const result = await pool.query(query);
  return result.rows.map(row => row.filename);
}

// Get list of migration files
function getMigrationFiles() {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    console.log('Creating migrations directory...');
    fs.mkdirSync(MIGRATIONS_DIR, { recursive: true });
    return [];
  }
  
  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(file => file.endsWith('.sql'))
    .sort();
  
  return files;
}

// Execute a single migration
async function executeMigration(filename) {
  const filepath = path.join(MIGRATIONS_DIR, filename);
  const sql = fs.readFileSync(filepath, 'utf8');
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Execute the migration SQL
    await client.query(sql);
    
    // Record the migration
    await client.query(
      'INSERT INTO migrations (filename) VALUES ($1)',
      [filename]
    );
    
    await client.query('COMMIT');
    console.log(`✓ Executed migration: ${filename}`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`✗ Failed to execute migration ${filename}:`, error.message);
    throw error;
  } finally {
    client.release();
  }
}

// Main migration runner
async function runMigrations() {
  console.log('Starting database migrations...\n');
  
  try {
    // Ensure migrations table exists
    await createMigrationsTable();
    
    // Get executed migrations
    const executedMigrations = await getExecutedMigrations();
    console.log(`Found ${executedMigrations.length} executed migrations`);
    
    // Get migration files
    const migrationFiles = getMigrationFiles();
    console.log(`Found ${migrationFiles.length} migration files\n`);
    
    // Find pending migrations
    const pendingMigrations = migrationFiles.filter(
      file => !executedMigrations.includes(file)
    );
    
    if (pendingMigrations.length === 0) {
      console.log('✓ All migrations completed - database is up to date!');
      return;
    }
    
    console.log(`Executing ${pendingMigrations.length} pending migrations...\n`);
    
    // Execute pending migrations
    for (const migration of pendingMigrations) {
      await executeMigration(migration);
    }
    
    console.log('\n✓ All migrations completed successfully!');
    
  } catch (error) {
    console.error('\n✗ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run migrations if called directly
if (require.main === module) {
  runMigrations().catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
}

module.exports = { runMigrations };