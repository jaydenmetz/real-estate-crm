#!/usr/bin/env node

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Use local database
const pool = new Pool({
  connectionString: 'postgresql://postgres:password123@localhost:5432/real_estate_crm'
});

async function setupDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('Setting up clean local database...');
    
    // Drop existing tables to start fresh
    await client.query('BEGIN');
    
    await client.query(`
      DROP TABLE IF EXISTS 
        escrow_people,
        escrow_contacts,
        escrow_title_companies,
        documents,
        listings,
        clients,
        leads,
        appointments,
        escrows,
        users,
        teams,
        migrations
      CASCADE;
    `);
    
    // Create teams table first
    await client.query(`
      CREATE TABLE teams (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        team_id UUID UNIQUE DEFAULT gen_random_uuid(), -- For compatibility
        name VARCHAR(255) NOT NULL,
        subdomain VARCHAR(100) UNIQUE,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT true
      );
    `);
    
    // Create users table
    await client.query(`
      CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(100) UNIQUE,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'agent',
        team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
        password_hash VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        last_login TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    
    // Create escrows table with three-tier ID system
    await client.query(`
      CREATE TABLE escrows (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        team_id UUID REFERENCES teams(id),
        team_sequence_id INTEGER,
        display_id VARCHAR(20),
        global_id UUID DEFAULT gen_random_uuid(),
        
        property_address VARCHAR(255) NOT NULL,
        city VARCHAR(100),
        state VARCHAR(2),
        zip_code VARCHAR(10),
        property_type VARCHAR(50),
        
        transaction_type VARCHAR(20) NOT NULL,
        escrow_status VARCHAR(20) DEFAULT 'active',
        
        opening_date DATE,
        closing_date DATE,
        
        purchase_price DECIMAL(12, 2),
        earnest_money DECIMAL(12, 2),
        
        buyer_side_commission DECIMAL(5, 2),
        seller_side_commission DECIMAL(5, 2),
        
        notes TEXT,
        
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        
        CONSTRAINT unique_team_display_id UNIQUE (team_id, display_id),
        CONSTRAINT unique_global_id UNIQUE (global_id)
      );
    `);
    
    // Create other entity tables
    await client.query(`
      CREATE TABLE listings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        team_id UUID REFERENCES teams(id),
        team_sequence_id INTEGER,
        display_id VARCHAR(20),
        global_id UUID DEFAULT gen_random_uuid(),
        
        property_address VARCHAR(255) NOT NULL,
        city VARCHAR(100),
        state VARCHAR(2),
        zip_code VARCHAR(10),
        
        list_price DECIMAL(12, 2),
        status VARCHAR(50) DEFAULT 'active',
        listing_date DATE,
        
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      
      CREATE TABLE clients (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        team_id UUID REFERENCES teams(id),
        team_sequence_id INTEGER,
        display_id VARCHAR(20),
        global_id UUID DEFAULT gen_random_uuid(),
        
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20),
        client_type VARCHAR(20),
        
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      
      CREATE TABLE leads (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        team_id UUID REFERENCES teams(id),
        team_sequence_id INTEGER,
        display_id VARCHAR(20),
        global_id UUID DEFAULT gen_random_uuid(),
        
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        email VARCHAR(255),
        phone VARCHAR(20),
        source VARCHAR(100),
        status VARCHAR(50) DEFAULT 'new',
        
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      
      CREATE TABLE appointments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        team_id UUID REFERENCES teams(id),
        team_sequence_id INTEGER,
        display_id VARCHAR(20),
        global_id UUID DEFAULT gen_random_uuid(),
        
        title VARCHAR(255) NOT NULL,
        start_time TIMESTAMPTZ NOT NULL,
        end_time TIMESTAMPTZ,
        location VARCHAR(255),
        
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    
    // Create indexes
    await client.query(`
      CREATE INDEX idx_users_email ON users(email);
      CREATE INDEX idx_users_username ON users(username);
      CREATE INDEX idx_escrows_team_id ON escrows(team_id);
      CREATE INDEX idx_listings_team_id ON listings(team_id);
      CREATE INDEX idx_clients_team_id ON clients(team_id);
      CREATE INDEX idx_leads_team_id ON leads(team_id);
      CREATE INDEX idx_appointments_team_id ON appointments(team_id);
    `);
    
    // Insert default teams
    const teamResult = await client.query(`
      INSERT INTO teams (id, name, subdomain) 
      VALUES 
        (gen_random_uuid(), 'Jayden Metz Real Estate', 'jaydenmetz'),
        (gen_random_uuid(), 'Demo Team', 'demo')
      RETURNING id, name;
    `);
    
    const jaydenTeamId = teamResult.rows[0].id;
    
    // Create admin user
    const adminHash = await bcrypt.hash('Password123!', 10);
    await client.query(`
      INSERT INTO users (email, username, first_name, last_name, role, password_hash)
      VALUES ('admin@jaydenmetz.com', 'admin', 'System', 'Admin', 'system_admin', $1);
    `, [adminHash]);
    
    // Create jaydenmetz user
    const jaydenHash = await bcrypt.hash('Password123!', 10);
    await client.query(`
      INSERT INTO users (email, username, first_name, last_name, role, team_id, password_hash)
      VALUES ('realtor@jaydenmetz.com', 'jaydenmetz', 'Jayden', 'Metz', 'admin', $1, $2);
    `, [jaydenTeamId, jaydenHash]);
    
    // Add some sample data
    await client.query(`
      INSERT INTO escrows (
        team_id, team_sequence_id, display_id, 
        property_address, city, state, zip_code,
        transaction_type, purchase_price, closing_date
      ) VALUES 
        ($1, 1, 'ESCROW-2025-001', '123 Main St', 'San Diego', 'CA', '92101', 'purchase', 500000, '2025-08-15'),
        ($1, 2, 'ESCROW-2025-002', '456 Oak Ave', 'La Jolla', 'CA', '92037', 'sale', 1200000, '2025-09-01'),
        ($1, 3, 'ESCROW-2025-003', '789 Pine St', 'Del Mar', 'CA', '92014', 'purchase', 850000, '2025-08-30');
    `, [jaydenTeamId]);
    
    await client.query('COMMIT');
    
    console.log('✅ Database setup complete!');
    console.log('\nCreated users:');
    console.log('- admin / Password123! (System Admin)');
    console.log('- jaydenmetz / Password123! (Team Admin)');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error setting up database:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

setupDatabase().catch(console.error);