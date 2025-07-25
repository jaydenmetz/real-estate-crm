#!/usr/bin/env node

const { Pool } = require('pg');

// Use local database
const pool = new Pool({
  connectionString: 'postgresql://postgres:password123@localhost:5432/real_estate_crm'
});

async function createProfileAndSettingsTables() {
  const client = await pool.connect();
  
  try {
    console.log('Creating user profiles and settings tables...\n');
    
    await client.query('BEGIN');
    
    // 1. Create user_profiles table for public-facing data
    console.log('1. Creating user_profiles table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        
        -- Display Information
        display_name VARCHAR(255), -- "Jayden Metz (jaydenmetz)"
        professional_title VARCHAR(255) DEFAULT 'Real Estate Professional',
        bio TEXT,
        profile_photo_url VARCHAR(500),
        cover_photo_url VARCHAR(500),
        
        -- Professional Info
        license_number VARCHAR(100),
        years_experience INTEGER DEFAULT 0,
        specialties TEXT[], -- Array of specialties
        service_areas TEXT[], -- Array of neighborhoods/areas
        languages TEXT[] DEFAULT ARRAY['English'],
        
        -- Contact Display Settings
        show_email BOOLEAN DEFAULT true,
        show_phone BOOLEAN DEFAULT true,
        show_office BOOLEAN DEFAULT true,
        
        -- Social Media Links
        website_url VARCHAR(500),
        linkedin_url VARCHAR(500),
        facebook_url VARCHAR(500),
        instagram_url VARCHAR(500),
        twitter_url VARCHAR(500),
        youtube_url VARCHAR(500),
        
        -- SEO and Public URL
        slug VARCHAR(100) UNIQUE, -- for /profile/jaydenmetz
        meta_description TEXT,
        
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        
        CONSTRAINT unique_user_profile UNIQUE(user_id)
      );
    `);
    
    // 2. Create user_settings table for private preferences
    console.log('2. Creating user_settings table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        
        -- Notification Preferences
        email_notifications JSONB DEFAULT '{
          "new_lead": true,
          "appointment_reminder": true,
          "escrow_update": true,
          "team_invite": true,
          "weekly_summary": true
        }'::jsonb,
        
        sms_notifications JSONB DEFAULT '{
          "new_lead": true,
          "appointment_reminder": true,
          "urgent_only": false
        }'::jsonb,
        
        -- Display Preferences
        theme VARCHAR(20) DEFAULT 'light', -- light, dark, auto
        dashboard_layout JSONB DEFAULT '{}'::jsonb,
        default_view VARCHAR(50) DEFAULT 'dashboard',
        timezone VARCHAR(50) DEFAULT 'America/Los_Angeles',
        date_format VARCHAR(20) DEFAULT 'MM/DD/YYYY',
        
        -- Privacy Settings
        profile_visibility VARCHAR(20) DEFAULT 'public', -- public, team, private
        activity_visibility VARCHAR(20) DEFAULT 'team', -- public, team, private
        
        -- Integration Settings
        calendar_sync JSONB DEFAULT '{}'::jsonb,
        email_signature TEXT,
        
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        
        CONSTRAINT unique_user_settings UNIQUE(user_id)
      );
    `);
    
    // 3. Create profile_statistics table for achievements/stats
    console.log('3. Creating profile_statistics table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS profile_statistics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        
        -- Lifetime Statistics
        total_sales INTEGER DEFAULT 0,
        total_sales_volume DECIMAL(15, 2) DEFAULT 0,
        total_listings INTEGER DEFAULT 0,
        total_buyers_represented INTEGER DEFAULT 0,
        total_sellers_represented INTEGER DEFAULT 0,
        
        -- Current Year Statistics
        current_year_sales INTEGER DEFAULT 0,
        current_year_volume DECIMAL(15, 2) DEFAULT 0,
        current_year_listings INTEGER DEFAULT 0,
        
        -- Performance Metrics
        average_days_on_market DECIMAL(5, 2),
        average_sale_to_list_ratio DECIMAL(5, 2),
        
        -- Achievements
        achievements JSONB DEFAULT '[]'::jsonb, -- Array of achievement objects
        certifications JSONB DEFAULT '[]'::jsonb, -- Array of certifications
        awards JSONB DEFAULT '[]'::jsonb, -- Array of awards
        
        -- Last Update
        last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        
        CONSTRAINT unique_user_statistics UNIQUE(user_id)
      );
    `);
    
    // 4. Create profile_testimonials table
    console.log('4. Creating profile_testimonials table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS profile_testimonials (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        
        client_name VARCHAR(255) NOT NULL,
        client_type VARCHAR(20), -- buyer, seller
        testimonial_text TEXT NOT NULL,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        transaction_date DATE,
        
        is_featured BOOLEAN DEFAULT false,
        is_visible BOOLEAN DEFAULT true,
        
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // 5. Create indexes
    console.log('5. Creating indexes...');
    await client.query(`
      CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
      CREATE INDEX idx_user_profiles_slug ON user_profiles(slug);
      CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
      CREATE INDEX idx_profile_statistics_user_id ON profile_statistics(user_id);
      CREATE INDEX idx_profile_testimonials_user_id ON profile_testimonials(user_id);
      CREATE INDEX idx_profile_testimonials_featured ON profile_testimonials(user_id, is_featured) WHERE is_visible = true;
    `);
    
    // 6. Create profile for existing users
    console.log('6. Creating profiles for existing users...');
    
    // Get existing users
    const users = await client.query('SELECT id, username, first_name, last_name, email FROM users');
    
    for (const user of users.rows) {
      // Create profile
      await client.query(`
        INSERT INTO user_profiles (user_id, display_name, slug, professional_title)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id) DO NOTHING
      `, [
        user.id,
        `${user.first_name} ${user.last_name} (${user.username})`,
        user.username,
        user.username === 'admin' ? 'System Administrator' : 'Real Estate Professional'
      ]);
      
      // Create settings
      await client.query(`
        INSERT INTO user_settings (user_id)
        VALUES ($1)
        ON CONFLICT (user_id) DO NOTHING
      `, [user.id]);
      
      // Create statistics
      await client.query(`
        INSERT INTO profile_statistics (user_id)
        VALUES ($1)
        ON CONFLICT (user_id) DO NOTHING
      `, [user.id]);
      
      console.log(`   ✓ Created profile for ${user.username}`);
    }
    
    // 7. Add some sample data for jaydenmetz
    console.log('7. Adding sample data for jaydenmetz...');
    
    const jaydenUser = await client.query('SELECT id FROM users WHERE username = $1', ['jaydenmetz']);
    if (jaydenUser.rows.length > 0) {
      const userId = jaydenUser.rows[0].id;
      
      // Update profile with more details
      await client.query(`
        UPDATE user_profiles
        SET 
          professional_title = 'Luxury Real Estate Specialist',
          bio = 'With over 10 years of experience in San Diego real estate, I specialize in luxury homes and waterfront properties. My commitment to exceptional service and deep market knowledge ensures my clients achieve their real estate goals.',
          license_number = 'DRE# 01234567',
          years_experience = 10,
          specialties = ARRAY['Luxury Homes', 'Waterfront Properties', 'Investment Properties', 'First-Time Buyers'],
          service_areas = ARRAY['La Jolla', 'Del Mar', 'Carmel Valley', 'Rancho Santa Fe', 'Coronado', 'Point Loma']
        WHERE user_id = $1
      `, [userId]);
      
      // Update statistics
      await client.query(`
        UPDATE profile_statistics
        SET 
          total_sales = 127,
          total_sales_volume = 95000000,
          total_listings = 89,
          total_buyers_represented = 78,
          total_sellers_represented = 49,
          current_year_sales = 15,
          current_year_volume = 18500000,
          current_year_listings = 12,
          average_days_on_market = 28.5,
          average_sale_to_list_ratio = 98.7,
          achievements = '[
            {"year": 2024, "title": "Top Producer", "issuer": "San Diego Association of Realtors"},
            {"year": 2023, "title": "Luxury Home Specialist", "issuer": "Institute for Luxury Home Marketing"}
          ]'::jsonb
        WHERE user_id = $1
      `, [userId]);
      
      // Add testimonials
      await client.query(`
        INSERT INTO profile_testimonials (user_id, client_name, client_type, testimonial_text, rating, transaction_date, is_featured)
        VALUES 
          ($1, 'Sarah & Michael Chen', 'buyer', 'Jayden made our dream of owning a home in La Jolla a reality. His expertise and dedication were evident throughout the entire process.', 5, '2024-03-15', true),
          ($1, 'Robert Williams', 'seller', 'Sold our home in just 12 days above asking price! Jayden''s marketing strategy and negotiation skills are outstanding.', 5, '2024-02-20', true),
          ($1, 'Emily Thompson', 'buyer', 'As first-time buyers, we were nervous about the process. Jayden guided us every step of the way with patience and professionalism.', 5, '2024-01-10', false)
      `, [userId]);
      
      console.log('   ✓ Added sample data for jaydenmetz');
    }
    
    await client.query('COMMIT');
    
    console.log('\n✅ Profile and settings tables created successfully!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating tables:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

createProfileAndSettingsTables().catch(console.error);