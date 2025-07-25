const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const pool = new Pool({
  connectionString: process.env.RAILWAY_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function implementUniversalIdSystemFixed() {
  const client = await pool.connect();
  
  try {
    console.log('🔢 Implementing three-tier ID system for all entities...\n');
    
    await client.query('BEGIN');
    
    // Define entities with their specific configurations
    const entities = [
      { 
        table: 'escrows', 
        prefix: 'ESC', 
        name: 'Escrow',
        primaryKey: 'display_id'  // escrows use display_id as primary
      },
      { 
        table: 'listings', 
        prefix: 'LST', 
        name: 'Listing',
        primaryKey: 'id'
      },
      { 
        table: 'clients', 
        prefix: 'CLT', 
        name: 'Client',
        primaryKey: 'id'
      },
      { 
        table: 'leads', 
        prefix: 'LED', 
        name: 'Lead',
        primaryKey: 'id'
      },
      { 
        table: 'appointments', 
        prefix: 'APT', 
        name: 'Appointment',
        primaryKey: 'id'
      }
    ];
    
    // 1. Ensure teams exist
    console.log('1️⃣ Getting default team...');
    let teamId;
    const teamCheck = await client.query(`
      SELECT team_id FROM teams WHERE subdomain = 'jaydenmetz' LIMIT 1
    `);
    
    if (teamCheck.rows.length > 0) {
      teamId = teamCheck.rows[0].team_id;
      console.log('✅ Using existing team');
    } else {
      const newTeam = await client.query(`
        INSERT INTO teams (name, subdomain, settings)
        VALUES ('Jayden Metz Real Estate', 'jaydenmetz', '{"theme": "professional"}')
        RETURNING team_id
      `);
      teamId = newTeam.rows[0].team_id;
      console.log('✅ Created new team');
    }
    
    // 2. Add three-tier ID columns to all entity tables
    console.log('\n2️⃣ Adding three-tier ID columns to all entities...');
    
    for (const entity of entities) {
      console.log(`\n   Processing ${entity.name} table...`);
      
      try {
        // Add columns
        await client.query(`
          ALTER TABLE ${entity.table} 
          ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(team_id),
          ADD COLUMN IF NOT EXISTS team_sequence_id INTEGER,
          ADD COLUMN IF NOT EXISTS display_id VARCHAR(20),
          ADD COLUMN IF NOT EXISTS global_id VARCHAR(50)
        `);
        
        console.log(`   ✅ ${entity.name} columns added`);
      } catch (error) {
        console.log(`   ⚠️  ${entity.name}: ${error.message}`);
      }
    }
    
    // 3. Create custom UUID generator with entity prefix
    console.log('\n3️⃣ Creating prefixed UUID generator...');
    await client.query(`
      CREATE OR REPLACE FUNCTION generate_prefixed_uuid(p_prefix TEXT)
      RETURNS VARCHAR AS $$
      DECLARE
        v_uuid UUID;
        v_uuid_text TEXT;
      BEGIN
        v_uuid := gen_random_uuid();
        v_uuid_text := v_uuid::TEXT;
        -- Replace first 3 characters with prefix
        v_uuid_text := LOWER(p_prefix) || SUBSTRING(v_uuid_text FROM 4);
        RETURN v_uuid_text;
      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log('✅ Prefixed UUID generator created');
    
    // 4. Update existing records with three-tier IDs
    console.log('\n4️⃣ Updating existing records with three-tier IDs...');
    
    for (const entity of entities) {
      try {
        // First, assign all records to default team
        await client.query(`
          UPDATE ${entity.table}
          SET team_id = $1
          WHERE team_id IS NULL
        `, [teamId]);
        
        // Generate team_sequence_ids (starting from 1 for each entity type)
        await client.query(`
          WITH numbered_records AS (
            SELECT 
              ${entity.primaryKey},
              ROW_NUMBER() OVER (PARTITION BY team_id ORDER BY created_at, ${entity.primaryKey}) as seq_num
            FROM ${entity.table}
            WHERE team_id = $1
          )
          UPDATE ${entity.table} e
          SET team_sequence_id = nr.seq_num
          FROM numbered_records nr
          WHERE e.${entity.primaryKey} = nr.${entity.primaryKey}
        `, [teamId]);
        
        // Generate display_ids (ESC-2025-001, LST-2025-001, etc.)
        await client.query(`
          UPDATE ${entity.table}
          SET display_id = CONCAT('${entity.prefix}', '-', EXTRACT(YEAR FROM CURRENT_DATE), '-', 
                                  LPAD(team_sequence_id::TEXT, 3, '0'))
          WHERE team_id = $1 AND display_id IS NULL
        `, [teamId]);
        
        // Generate global_ids with entity prefix
        await client.query(`
          UPDATE ${entity.table}
          SET global_id = generate_prefixed_uuid('${entity.prefix}')
          WHERE global_id IS NULL
        `);
        
        const count = await client.query(`
          SELECT COUNT(*) FROM ${entity.table} WHERE team_id = $1
        `, [teamId]);
        
        console.log(`   ✅ Updated ${count.rows[0].count} ${entity.name} records`);
        
      } catch (error) {
        console.log(`   ⚠️  ${entity.name}: ${error.message}`);
      }
    }
    
    // 5. Create example records for each entity to show the system
    console.log('\n5️⃣ Creating example records...');
    
    // Create example listing
    try {
      await client.query(`
        INSERT INTO listings (
          id, team_id, team_sequence_id, display_id, global_id,
          property_address, list_price, listing_status, mls_number,
          bedrooms, bathrooms, square_feet, created_at
        ) VALUES (
          gen_random_uuid(), $1, 
          (SELECT COALESCE(MAX(team_sequence_id), 0) + 1 FROM listings WHERE team_id = $1),
          CONCAT('LST-', EXTRACT(YEAR FROM CURRENT_DATE), '-', 
                 LPAD(((SELECT COALESCE(MAX(team_sequence_id), 0) + 1 FROM listings WHERE team_id = $1))::TEXT, 3, '0')),
          generate_prefixed_uuid('LST'),
          '123 Example St, Demo City, CA 90210',
          450000, 'Active', 'MLS123456',
          3, 2, 1800, NOW()
        )
      `, [teamId]);
      console.log('   ✅ Created example listing');
    } catch (error) {
      console.log('   ⏭️  Listing example skipped');
    }
    
    // 6. Show the three-tier system in action
    console.log('\n📊 Three-Tier ID System Examples:\n');
    
    for (const entity of entities) {
      try {
        const examples = await client.query(`
          SELECT 
            team_sequence_id as "Simple ID",
            display_id as "Display ID",
            SUBSTRING(global_id, 1, 13) || '...' as "Global ID (Prefixed)"
          FROM ${entity.table}
          WHERE team_id = $1
          ORDER BY team_sequence_id DESC
          LIMIT 3
        `, [teamId]);
        
        if (examples.rows.length > 0) {
          console.log(`${entity.name}s:`);
          console.log('╔═══════════╤═══════════════╤═════════════════════╗');
          console.log('║ Simple ID │ Display ID    │ Global ID           ║');
          console.log('╠═══════════╪═══════════════╪═════════════════════╣');
          examples.rows.forEach(row => {
            const simpleId = (row['Simple ID'] || '').toString().padEnd(9);
            const displayId = (row['Display ID'] || '').padEnd(13);
            const globalId = (row['Global ID (Prefixed)'] || '').padEnd(19);
            console.log(`║ ${simpleId} │ ${displayId} │ ${globalId} ║`);
          });
          console.log('╚═══════════╧═══════════════╧═════════════════════╝\n');
        }
      } catch (error) {
        // Skip if error
      }
    }
    
    // 7. Create indexes for performance
    console.log('7️⃣ Creating indexes for performance...');
    for (const entity of entities) {
      try {
        await client.query(`
          CREATE INDEX IF NOT EXISTS idx_${entity.table}_team_id ON ${entity.table}(team_id);
          CREATE INDEX IF NOT EXISTS idx_${entity.table}_display_id ON ${entity.table}(team_id, display_id);
          CREATE INDEX IF NOT EXISTS idx_${entity.table}_global_id ON ${entity.table}(global_id);
          CREATE INDEX IF NOT EXISTS idx_${entity.table}_team_seq ON ${entity.table}(team_id, team_sequence_id);
        `);
      } catch (error) {
        // Skip if error
      }
    }
    console.log('✅ Indexes created');
    
    await client.query('COMMIT');
    
    console.log('\n✅ Universal three-tier ID system implemented successfully!');
    console.log('\n🔢 ID System Summary:');
    console.log('   1. Simple ID: 1, 2, 3... (per team, per entity type)');
    console.log('   2. Display ID: ESC-2025-001, LST-2025-001, etc.');
    console.log('   3. Global ID: UUID with entity prefix (esc-xxxx, lst-xxxx)');
    console.log('\n📝 Entity Prefixes:');
    console.log('   ESC = Escrows');
    console.log('   LST = Listings'); 
    console.log('   CLT = Clients');
    console.log('   LED = Leads');
    console.log('   APT = Appointments');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

implementUniversalIdSystemFixed();