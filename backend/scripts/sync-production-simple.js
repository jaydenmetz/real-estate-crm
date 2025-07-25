#!/usr/bin/env node
require('dotenv').config();
const { Client } = require('pg');
const bcrypt = require('bcryptjs');

// Production database config (Railway)
const productionConfig = {
  connectionString: 'postgresql://postgres:ueLIWnvALZWVbRdnOmpLGsrrukeGLGQQ@ballast.proxy.rlwy.net:20017/railway',
  ssl: {
    rejectUnauthorized: false
  }
};

async function syncProduction() {
  const prodClient = new Client(productionConfig);

  try {
    console.log('🔄 Connecting to production database...');
    await prodClient.connect();
    console.log('✅ Connected to production database');

    // 1. Ensure profile tables exist
    console.log('\n📋 Creating profile tables...');
    
    await prodClient.query(`
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
    `);
    console.log('✅ Created user_profiles table');

    await prodClient.query(`
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
    `);
    console.log('✅ Created user_settings table');

    await prodClient.query(`
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
    `);
    console.log('✅ Created profile_statistics table');

    // 2. Add missing columns to users table
    console.log('\n🔧 Updating users table...');
    await prodClient.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name VARCHAR(255);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(50);
    `);
    console.log('✅ Updated users table');

    // 3. Check and create users
    console.log('\n👥 Checking users...');
    
    // Check if admin exists
    const adminCheck = await prodClient.query(`
      SELECT id, username, email FROM users WHERE email = 'admin@jaydenmetz.com'
    `);

    if (adminCheck.rows.length === 0) {
      console.log('Creating admin user...');
      const adminHash = await bcrypt.hash('Password123!', 10);
      await prodClient.query(`
        INSERT INTO users (email, username, first_name, last_name, role, password_hash, is_active)
        VALUES ('admin@jaydenmetz.com', 'admin', 'System', 'Admin', 'system_admin', $1, true);
      `, [adminHash]);
      console.log('✅ Admin user created');
    } else {
      // Update username if needed
      await prodClient.query(`
        UPDATE users SET username = 'admin' WHERE email = 'admin@jaydenmetz.com' AND username IS NULL;
      `);
      console.log('✅ Admin user exists');
    }

    // Check if jaydenmetz exists
    const jaydenCheck = await prodClient.query(`
      SELECT id, username, email FROM users WHERE email = 'realtor@jaydenmetz.com'
    `);

    let jaydenUserId;
    if (jaydenCheck.rows.length === 0) {
      console.log('Creating jaydenmetz user...');
      const jaydenHash = await bcrypt.hash('Password123!', 10);
      const jaydenResult = await prodClient.query(`
        INSERT INTO users (email, username, first_name, last_name, role, password_hash, is_active, display_name)
        VALUES ('realtor@jaydenmetz.com', 'jaydenmetz', 'Jayden', 'Metz', 'admin', $1, true, 'Jayden Metz (jaydenmetz)')
        RETURNING id;
      `, [jaydenHash]);
      jaydenUserId = jaydenResult.rows[0].id;
      console.log('✅ Jaydenmetz user created');
    } else {
      jaydenUserId = jaydenCheck.rows[0].id;
      // Update username and display_name if needed
      await prodClient.query(`
        UPDATE users 
        SET username = 'jaydenmetz', 
            display_name = 'Jayden Metz (jaydenmetz)'
        WHERE email = 'realtor@jaydenmetz.com' AND (username IS NULL OR display_name IS NULL);
      `);
      console.log('✅ Jaydenmetz user exists');
    }

    // Create profile for jaydenmetz if doesn't exist
    const profileCheck = await prodClient.query(`
      SELECT id FROM user_profiles WHERE user_id = $1
    `, [jaydenUserId]);

    if (profileCheck.rows.length === 0) {
      console.log('Creating jaydenmetz profile...');
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
        );
      `, [jaydenUserId]);
      console.log('✅ Jaydenmetz profile created');
    }

    // Create settings for jaydenmetz if doesn't exist
    const settingsCheck = await prodClient.query(`
      SELECT id FROM user_settings WHERE user_id = $1
    `, [jaydenUserId]);

    if (settingsCheck.rows.length === 0) {
      console.log('Creating jaydenmetz settings...');
      await prodClient.query(`
        INSERT INTO user_settings (user_id) VALUES ($1);
      `, [jaydenUserId]);
      console.log('✅ Jaydenmetz settings created');
    }

    // Create some sample statistics
    await prodClient.query(`
      INSERT INTO profile_statistics (user_id, statistic_type, label, value, icon, display_order)
      VALUES 
        ($1, 'custom', 'Client Satisfaction Rate', '98%', 'star', 1),
        ($1, 'custom', 'Average Response Time', '< 1 hour', 'speed', 2),
        ($1, 'custom', 'Repeat Clients', '65%', 'people', 3)
      ON CONFLICT DO NOTHING;
    `, [jaydenUserId]);

    // 4. Check teams
    console.log('\n🏢 Checking teams...');
    
    // First check if teams table has id or team_id column
    const teamColumns = await prodClient.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'teams' 
      AND column_name IN ('id', 'team_id');
    `);
    
    const idColumn = teamColumns.rows.find(r => r.column_name === 'id') ? 'id' : 'team_id';
    
    const teamCheck = await prodClient.query(`
      SELECT ${idColumn}, name FROM teams WHERE name = 'Jayden Metz Real Estate'
    `);

    if (teamCheck.rows.length === 0) {
      console.log('Creating Jayden Metz Real Estate team...');
      await prodClient.query(`
        INSERT INTO teams (name, owner_id, type)
        VALUES ('Jayden Metz Real Estate', $1, 'individual');
      `, [jaydenUserId]);
      console.log('✅ Team created');
    } else {
      console.log('✅ Team exists');
    }

    // 5. Get summary
    console.log('\n📊 Production database summary:');
    
    const userCount = await prodClient.query('SELECT COUNT(*) FROM users');
    const teamCount = await prodClient.query('SELECT COUNT(*) FROM teams');
    const profileCount = await prodClient.query('SELECT COUNT(*) FROM user_profiles');
    
    console.log(`- Users: ${userCount.rows[0].count}`);
    console.log(`- Teams: ${teamCount.rows[0].count}`);
    console.log(`- Profiles: ${profileCount.rows[0].count}`);

    console.log('\n✅ Production database sync complete!');

  } catch (error) {
    console.error('❌ Error during sync:', error);
    throw error;
  } finally {
    await prodClient.end();
  }
}

// Run the sync
console.log('🚀 Starting production database sync...\n');
syncProduction()
  .then(() => {
    console.log('\n✅ Sync completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Sync failed:', error.message);
    process.exit(1);
  });