const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const pool = new Pool({
  connectionString: process.env.RAILWAY_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function createTeamsTable() {
  const client = await pool.connect();
  
  try {
    console.log('🏢 Creating teams table and setting up multi-tenant structure...\n');
    
    await client.query('BEGIN');
    
    // 1. Create teams table
    console.log('1️⃣ Creating teams table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS teams (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        subdomain VARCHAR(100) UNIQUE NOT NULL,
        owner_user_id UUID REFERENCES users(id),
        settings JSONB DEFAULT '{}',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Teams table created');
    
    // 2. Add team_id to users table
    console.log('\n2️⃣ Adding team_id to users table...');
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id)
    `);
    console.log('✅ Added team_id to users');
    
    // 3. Create Jayden's personal team
    console.log('\n3️⃣ Creating personal team for Jayden...');
    const teamResult = await client.query(`
      INSERT INTO teams (name, subdomain, settings)
      VALUES ('Jayden Metz Real Estate', 'jaydenmetz', '{"theme": "professional"}')
      RETURNING id, name, subdomain
    `);
    const teamId = teamResult.rows[0].id;
    console.log('✅ Team created:', teamResult.rows[0]);
    
    // 4. Assign jaydenmetz user to their team
    console.log('\n4️⃣ Assigning jaydenmetz user to team...');
    await client.query(`
      UPDATE users 
      SET team_id = $1 
      WHERE username = 'jaydenmetz'
    `, [teamId]);
    
    // Also set as team owner
    await client.query(`
      UPDATE teams 
      SET owner_user_id = (SELECT id FROM users WHERE username = 'jaydenmetz')
      WHERE id = $1
    `, [teamId]);
    console.log('✅ User assigned to team');
    
    // 5. Assign existing data to Jayden's team
    console.log('\n5️⃣ Migrating existing data to team...');
    
    // Update escrows
    const escrowUpdate = await client.query(`
      UPDATE escrows 
      SET team_id = $1 
      WHERE team_id IS NULL
    `, [teamId]);
    console.log(`✅ Migrated ${escrowUpdate.rowCount} escrows`);
    
    // Update listings
    const listingUpdate = await client.query(`
      UPDATE listings 
      SET team_id = $1 
      WHERE team_id IS NULL
    `, [teamId]);
    console.log(`✅ Migrated ${listingUpdate.rowCount} listings`);
    
    // Update clients
    const clientUpdate = await client.query(`
      UPDATE clients 
      SET team_id = $1 
      WHERE team_id IS NULL
    `, [teamId]);
    console.log(`✅ Migrated ${clientUpdate.rowCount} clients`);
    
    // Update leads
    const leadUpdate = await client.query(`
      UPDATE leads 
      SET team_id = $1 
      WHERE team_id IS NULL
    `, [teamId]);
    console.log(`✅ Migrated ${leadUpdate.rowCount} leads`);
    
    // Update appointments
    const appointmentUpdate = await client.query(`
      UPDATE appointments 
      SET team_id = $1 
      WHERE team_id IS NULL
    `, [teamId]);
    console.log(`✅ Migrated ${appointmentUpdate.rowCount} appointments`);
    
    // 6. Create sample team for testing
    console.log('\n6️⃣ Creating sample team for demo...');
    await client.query(`
      INSERT INTO teams (name, subdomain, settings)
      VALUES ('Demo Real Estate Team', 'demo', '{"theme": "modern"}')
    `);
    console.log('✅ Demo team created');
    
    // 7. Show final structure
    console.log('\n📊 Current team structure:');
    const teams = await client.query(`
      SELECT 
        t.subdomain,
        t.name,
        u.username as owner,
        (SELECT COUNT(*) FROM users WHERE team_id = t.id) as user_count,
        (SELECT COUNT(*) FROM escrows WHERE team_id = t.id) as escrow_count
      FROM teams t
      LEFT JOIN users u ON t.owner_user_id = u.id
      ORDER BY t.created_at
    `);
    
    console.log('╔══════════════╤══════════════════════════╤═══════════╤═══════╤═════════╗');
    console.log('║ Subdomain    │ Team Name                │ Owner     │ Users │ Escrows ║');
    console.log('╠══════════════╪══════════════════════════╪═══════════╪═══════╪═════════╣');
    teams.rows.forEach(team => {
      console.log(`║ ${team.subdomain.padEnd(12)} │ ${team.name.padEnd(24)} │ ${(team.owner || 'none').padEnd(9)} │ ${team.user_count.toString().padEnd(5)} │ ${team.escrow_count.toString().padEnd(7)} ║`);
    });
    console.log('╚══════════════╧══════════════════════════╧═══════════╧═══════╧═════════╝');
    
    await client.query('COMMIT');
    
    console.log('\n✅ Multi-tenant setup complete!');
    console.log('\n🔐 Access structure:');
    console.log('   admin user → Can view all teams (system_admin role)');
    console.log('   jaydenmetz → Own team data only (jaydenmetz subdomain)');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

createTeamsTable();