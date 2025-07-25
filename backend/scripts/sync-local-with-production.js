#!/usr/bin/env node
require('dotenv').config();
const { Client } = require('pg');
const bcrypt = require('bcryptjs');

// Local database config
const localConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'real_estate_crm',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
};

// Production database config (Railway)
const productionConfig = {
  connectionString: process.env.RAILWAY_DATABASE_URL || 'postgresql://postgres:ueLIWnvALZWVbRdnOmpLGsrrukeGLGQQ@ballast.proxy.rlwy.net:20017/railway',
  ssl: {
    rejectUnauthorized: false
  }
};

async function syncDatabases() {
  const localClient = new Client(localConfig);
  const prodClient = new Client(productionConfig);

  try {
    console.log('🔄 Connecting to databases...');
    await localClient.connect();
    await prodClient.connect();

    console.log('✅ Connected to both databases');

    // Get structure comparison
    console.log('\n📊 Checking database structures...');
    
    // Get local tables
    const localTables = await localClient.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    // Get production tables
    const prodTables = await prodClient.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.log('\n📋 Local tables:', localTables.rows.map(r => r.table_name).join(', '));
    console.log('📋 Production tables:', prodTables.rows.map(r => r.table_name).join(', '));

    // Tables that need to be created in production
    const localTableNames = new Set(localTables.rows.map(r => r.table_name));
    const prodTableNames = new Set(prodTables.rows.map(r => r.table_name));
    
    const tablesToCreate = [...localTableNames].filter(t => !prodTableNames.has(t));
    
    if (tablesToCreate.length > 0) {
      console.log('\n🆕 Tables to create in production:', tablesToCreate.join(', '));
      
      // Create missing tables
      for (const tableName of tablesToCreate) {
        console.log(`\n📝 Creating table: ${tableName}`);
        
        // Get table structure from pg_dump style
        const tableColumns = await localClient.query(`
          SELECT 
            column_name,
            data_type,
            character_maximum_length,
            numeric_precision,
            numeric_scale,
            is_nullable,
            column_default
          FROM information_schema.columns
          WHERE table_schema = 'public' 
          AND table_name = $1
          ORDER BY ordinal_position;
        `, [tableName]);

        if (tableColumns.rows.length > 0) {
          // Build CREATE TABLE statement manually
          let createStatement = `CREATE TABLE IF NOT EXISTS ${tableName} (`;
          const columnDefs = [];
          
          for (const col of tableColumns.rows) {
            let columnDef = `"${col.column_name}" `;
            
            // Map data types
            switch (col.data_type) {
              case 'character varying':
                columnDef += `VARCHAR(${col.character_maximum_length || 255})`;
                break;
              case 'timestamp without time zone':
                columnDef += 'TIMESTAMP';
                break;
              case 'numeric':
                columnDef += `NUMERIC(${col.numeric_precision || 10}, ${col.numeric_scale || 2})`;
                break;
              case 'uuid':
                columnDef += 'UUID';
                break;
              case 'text':
                columnDef += 'TEXT';
                break;
              case 'integer':
                columnDef += 'INTEGER';
                break;
              case 'boolean':
                columnDef += 'BOOLEAN';
                break;
              case 'jsonb':
                columnDef += 'JSONB';
                break;
              case 'ARRAY':
                columnDef += 'TEXT[]';
                break;
              default:
                columnDef += col.data_type.toUpperCase();
            }
            
            if (col.is_nullable === 'NO') {
              columnDef += ' NOT NULL';
            }
            
            if (col.column_default) {
              columnDef += ` DEFAULT ${col.column_default}`;
            }
            
            columnDefs.push(columnDef);
          }
          
          createStatement += columnDefs.join(', ') + ');';
          
          await prodClient.query(createStatement);
          console.log(`✅ Created table: ${tableName}`);
        }
      }
    }

    // Sync critical table structures
    console.log('\n🔧 Ensuring critical columns exist...');
    
    // Add display_name column to users if missing
    await prodClient.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name VARCHAR(255);
    `);

    // Ensure profile tables exist
    const profileTableSQL = `
      -- User profiles table
      CREATE TABLE IF NOT EXISTS user_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        display_name VARCHAR(255),
        professional_title VARCHAR(255) DEFAULT 'Real Estate Professional',
        bio TEXT,
        license_number VARCHAR(100),
        years_experience INTEGER DEFAULT 0,
        specialties TEXT[],
        service_areas TEXT[],
        languages TEXT[] DEFAULT ARRAY['English'],
        website_url VARCHAR(500),
        linkedin_url VARCHAR(500),
        facebook_url VARCHAR(500),
        instagram_url VARCHAR(500),
        twitter_url VARCHAR(500),
        youtube_url VARCHAR(500),
        show_email BOOLEAN DEFAULT true,
        show_phone BOOLEAN DEFAULT true,
        show_office BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id)
      );

      -- User settings table
      CREATE TABLE IF NOT EXISTS user_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        theme VARCHAR(20) DEFAULT 'light',
        email_notifications JSONB DEFAULT '{}',
        sms_notifications JSONB DEFAULT '{}',
        language VARCHAR(10) DEFAULT 'en',
        timezone VARCHAR(50) DEFAULT 'America/Los_Angeles',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id)
      );

      -- Profile statistics table
      CREATE TABLE IF NOT EXISTS profile_statistics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        statistic_type VARCHAR(100) NOT NULL,
        label VARCHAR(255) NOT NULL,
        value VARCHAR(255) NOT NULL,
        icon VARCHAR(50),
        display_order INTEGER DEFAULT 0,
        is_visible BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await prodClient.query(profileTableSQL);
    console.log('✅ Profile tables ensured');

    // Check and sync users
    console.log('\n👥 Checking users...');
    
    const localUsers = await localClient.query(`
      SELECT username, email, first_name, last_name, role 
      FROM users 
      ORDER BY created_at;
    `);

    const prodUsers = await prodClient.query(`
      SELECT username, email, first_name, last_name, role 
      FROM users 
      ORDER BY created_at;
    `);

    console.log('\nLocal users:', localUsers.rows.length);
    console.log('Production users:', prodUsers.rows.length);

    // Check if admin and jaydenmetz exist in production
    const adminExists = prodUsers.rows.some(u => u.username === 'admin');
    const jaydenExists = prodUsers.rows.some(u => u.username === 'jaydenmetz');

    if (!adminExists) {
      console.log('\n🆕 Creating admin user in production...');
      const adminHash = await bcrypt.hash('Password123!', 10);
      await prodClient.query(`
        INSERT INTO users (email, username, first_name, last_name, role, password_hash, is_active)
        VALUES ('admin@jaydenmetz.com', 'admin', 'System', 'Admin', 'system_admin', $1, true)
        ON CONFLICT (email) DO NOTHING;
      `, [adminHash]);
      console.log('✅ Admin user created');
    }

    if (!jaydenExists) {
      console.log('\n🆕 Creating jaydenmetz user in production...');
      const jaydenHash = await bcrypt.hash('Password123!', 10);
      const jaydenResult = await prodClient.query(`
        INSERT INTO users (email, username, first_name, last_name, role, password_hash, is_active, display_name)
        VALUES ('realtor@jaydenmetz.com', 'jaydenmetz', 'Jayden', 'Metz', 'admin', $1, true, 'Jayden Metz (jaydenmetz)')
        ON CONFLICT (email) DO NOTHING
        RETURNING id;
      `, [jaydenHash]);

      if (jaydenResult.rows.length > 0) {
        const userId = jaydenResult.rows[0].id;
        
        // Create profile for jaydenmetz
        await prodClient.query(`
          INSERT INTO user_profiles (
            user_id, display_name, professional_title, bio,
            license_number, years_experience, specialties, service_areas
          ) VALUES (
            $1, 'Jayden Metz (jaydenmetz)', 'Luxury Real Estate Specialist',
            'Dedicated real estate professional specializing in luxury properties and first-time buyers.',
            'DRE# 01234567', 5,
            ARRAY['Luxury Homes', 'First-Time Buyers', 'Investment Properties'],
            ARRAY['La Jolla', 'Del Mar', 'Carmel Valley', 'Rancho Santa Fe']
          ) ON CONFLICT (user_id) DO NOTHING;
        `, [userId]);

        // Create settings for jaydenmetz
        await prodClient.query(`
          INSERT INTO user_settings (user_id) 
          VALUES ($1) 
          ON CONFLICT (user_id) DO NOTHING;
        `, [userId]);
        
        console.log('✅ Jaydenmetz user and profile created');
      }
    }

    // Check teams
    console.log('\n🏢 Checking teams...');
    const prodTeams = await prodClient.query(`
      SELECT id, name, owner_id FROM teams ORDER BY created_at;
    `);
    
    console.log('Production teams:', prodTeams.rows.length);
    
    // Create Jayden Metz Real Estate team if not exists
    const jaydenTeamExists = prodTeams.rows.some(t => t.name === 'Jayden Metz Real Estate');
    if (!jaydenTeamExists && jaydenExists) {
      const jaydenUser = await prodClient.query(`
        SELECT id FROM users WHERE username = 'jaydenmetz';
      `);
      
      if (jaydenUser.rows.length > 0) {
        await prodClient.query(`
          INSERT INTO teams (name, owner_id, type)
          VALUES ('Jayden Metz Real Estate', $1, 'individual')
          ON CONFLICT DO NOTHING;
        `, [jaydenUser.rows[0].id]);
        console.log('✅ Created Jayden Metz Real Estate team');
      }
    }

    // Get record counts
    console.log('\n📊 Record counts comparison:');
    const tables = ['users', 'teams', 'escrows', 'listings', 'clients', 'leads', 'appointments'];
    
    for (const table of tables) {
      try {
        const localCount = await localClient.query(`SELECT COUNT(*) FROM ${table}`);
        const prodCount = await prodClient.query(`SELECT COUNT(*) FROM ${table}`);
        console.log(`${table}: Local=${localCount.rows[0].count}, Production=${prodCount.rows[0].count}`);
      } catch (e) {
        console.log(`${table}: Error checking - table might not exist`);
      }
    }

    console.log('\n✅ Database sync check complete!');
    console.log('\n📝 Summary:');
    console.log('- Profile tables are set up');
    console.log('- Admin and jaydenmetz users exist');
    console.log('- Teams are configured');
    console.log('\n⚠️  Note: This script performs a structure sync only.');
    console.log('To copy all data, you would need to export/import or use pg_dump.');

  } catch (error) {
    console.error('❌ Error during sync:', error);
    throw error;
  } finally {
    await localClient.end();
    await prodClient.end();
  }
}

// Run the sync
console.log('🚀 Starting database sync check...\n');
syncDatabases()
  .then(() => {
    console.log('\n✅ Sync check completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Sync failed:', error.message);
    process.exit(1);
  });