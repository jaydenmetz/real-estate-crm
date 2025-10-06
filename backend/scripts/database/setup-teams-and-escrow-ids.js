const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const pool = new Pool({
  connectionString: process.env.RAILWAY_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function setupTeamsAndEscrowIds() {
  const client = await pool.connect();
  
  try {
    console.log('🏢 Setting up teams and three-tier escrow ID system...\n');
    
    await client.query('BEGIN');
    
    // 1. Drop and recreate teams table with correct column name
    console.log('1️⃣ Creating teams table...');
    await client.query(`DROP TABLE IF EXISTS teams CASCADE`);
    await client.query(`
      CREATE TABLE teams (
        team_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        subdomain VARCHAR(100) UNIQUE NOT NULL,
        owner_user_id UUID,
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
      ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(team_id)
    `);
    console.log('✅ Added team_id to users');
    
    // 3. Add three-tier ID columns to escrows
    console.log('\n3️⃣ Adding three-tier ID system to escrows...');
    
    // Add new columns
    await client.query(`
      ALTER TABLE escrows 
      ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(team_id),
      ADD COLUMN IF NOT EXISTS team_sequence_id INTEGER,
      ADD COLUMN IF NOT EXISTS global_id UUID DEFAULT gen_random_uuid()
    `);
    
    // Rename existing id to display_id if needed
    const columnCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'escrows' AND column_name = 'display_id'
    `);
    
    if (columnCheck.rows.length === 0) {
      console.log('   Keeping id column as display_id reference...');
    }
    
    console.log('✅ Three-tier ID columns added');
    
    // 4. Create Jayden's personal team
    console.log('\n4️⃣ Creating personal team for Jayden...');
    const teamResult = await client.query(`
      INSERT INTO teams (name, subdomain, settings)
      VALUES ('Jayden Metz Real Estate', 'jaydenmetz', '{"theme": "professional"}')
      RETURNING team_id, name, subdomain
    `);
    const teamId = teamResult.rows[0].team_id;
    console.log('✅ Team created:', teamResult.rows[0]);
    
    // 5. Assign users to team
    console.log('\n5️⃣ Assigning users to teams...');
    
    // Assign jaydenmetz to their team
    await client.query(`
      UPDATE users 
      SET team_id = $1 
      WHERE username = 'jaydenmetz'
    `, [teamId]);
    
    // Set as team owner
    await client.query(`
      UPDATE teams 
      SET owner_user_id = (SELECT id FROM users WHERE username = 'jaydenmetz')
      WHERE team_id = $1
    `, [teamId]);
    
    // Keep admin user without team (system-wide access)
    await client.query(`
      UPDATE users 
      SET team_id = NULL 
      WHERE username = 'admin'
    `);
    
    console.log('✅ Users assigned to teams');
    
    // 6. Create demo team
    console.log('\n6️⃣ Creating demo team...');
    const demoTeamResult = await client.query(`
      INSERT INTO teams (name, subdomain, settings)
      VALUES ('Demo Real Estate Team', 'demo', '{"theme": "modern"}')
      RETURNING team_id
    `);
    const demoTeamId = demoTeamResult.rows[0].team_id;
    
    // Assign test users to demo team
    await client.query(`
      UPDATE users 
      SET team_id = $1 
      WHERE username IN ('agent', 'broker', 'assistant')
    `, [demoTeamId]);
    console.log('✅ Demo team created');
    
    // 7. Update existing escrows with team assignments and sequential IDs
    console.log('\n7️⃣ Updating escrows with team data and sequential IDs...');
    
    // Assign all existing escrows to Jayden's team
    await client.query(`
      UPDATE escrows 
      SET team_id = $1,
          global_id = COALESCE(global_id, gen_random_uuid())
      WHERE team_id IS NULL
    `, [teamId]);
    
    // Generate team_sequence_ids for existing escrows
    await client.query(`
      WITH numbered_escrows AS (
        SELECT 
          id,
          ROW_NUMBER() OVER (PARTITION BY team_id ORDER BY created_at, id) as seq_num
        FROM escrows
        WHERE team_id = $1
      )
      UPDATE escrows e
      SET team_sequence_id = ne.seq_num
      FROM numbered_escrows ne
      WHERE e.id = ne.id
    `, [teamId]);
    
    console.log('✅ Escrows updated with team assignments');
    
    // 8. Create helper function for generating display IDs
    console.log('\n8️⃣ Creating display ID generator function...');
    await client.query(`
      CREATE OR REPLACE FUNCTION generate_escrow_display_id(p_team_id UUID)
      RETURNS VARCHAR AS $$
      DECLARE
        v_year INTEGER;
        v_sequence INTEGER;
        v_display_id VARCHAR(20);
      BEGIN
        v_year := EXTRACT(YEAR FROM CURRENT_DATE);
        
        -- Get next sequence for this team and year
        SELECT COALESCE(MAX(
          CAST(
            SUBSTRING(display_id FROM 'ESC-[0-9]{4}-([0-9]+)')
            AS INTEGER
          )
        ), 0) + 1
        INTO v_sequence
        FROM escrows
        WHERE team_id = p_team_id
        AND display_id LIKE CONCAT('ESC-', v_year, '-%');
        
        v_display_id := CONCAT('ESC-', v_year, '-', LPAD(v_sequence::TEXT, 3, '0'));
        
        RETURN v_display_id;
      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log('✅ Display ID generator created');
    
    // 9. Show escrow structure
    console.log('\n📊 Escrow ID Structure Example:');
    const escrowExample = await client.query(`
      SELECT 
        team_sequence_id as "Simple ID",
        display_id as "Reference ID",
        SUBSTRING(global_id::TEXT, 1, 8) || '...' as "Global ID (UUID)",
        property_address as "Property"
      FROM escrows
      WHERE team_id = $1
      ORDER BY team_sequence_id
      LIMIT 5
    `, [teamId]);
    
    if (escrowExample.rows.length > 0) {
      console.log('╔══════════╤═══════════════╤══════════════════╤══════════════════════════╗');
      console.log('║ Simple   │ Reference     │ Global ID        │ Property                 ║');
      console.log('╠══════════╪═══════════════╪══════════════════╪══════════════════════════╣');
      escrowExample.rows.forEach(row => {
        const simpleId = (row['Simple ID'] || 'N/A').toString().padEnd(8);
        const refId = (row['Reference ID'] || 'N/A').padEnd(13);
        const globalId = (row['Global ID (UUID)'] || 'N/A').padEnd(16);
        const property = (row['Property'] || 'N/A').substring(0, 24).padEnd(24);
        console.log(`║ ${simpleId} │ ${refId} │ ${globalId} │ ${property} ║`);
      });
      console.log('╚══════════╧═══════════════╧══════════════════╧══════════════════════════╝');
    }
    
    // 10. Show team summary
    console.log('\n📊 Team Summary:');
    const teamSummary = await client.query(`
      SELECT 
        t.subdomain,
        t.name,
        (SELECT COUNT(*) FROM users WHERE team_id = t.team_id) as users,
        (SELECT COUNT(*) FROM escrows WHERE team_id = t.team_id) as escrows
      FROM teams t
      ORDER BY t.created_at
    `);
    
    teamSummary.rows.forEach(team => {
      console.log(`   ${team.subdomain}: ${team.name} (${team.users} users, ${team.escrows} escrows)`);
    });
    
    await client.query('COMMIT');
    
    console.log('\n✅ Setup complete!');
    console.log('\n🔑 Three-Tier Escrow ID System:');
    console.log('   1. Simple ID: Sequential per team (1, 2, 3...)');
    console.log('   2. Reference ID: Year-based per team (ESC-2025-001)');
    console.log('   3. Global ID: UUID unique across all teams');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

setupTeamsAndEscrowIds();