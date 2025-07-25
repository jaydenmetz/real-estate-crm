const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const pool = new Pool({
  connectionString: process.env.RAILWAY_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function implementUniversalIdSystem() {
  const client = await pool.connect();
  
  try {
    console.log('🔢 Implementing three-tier ID system for all entities...\n');
    
    await client.query('BEGIN');
    
    // Define entities and their prefixes
    const entities = [
      { table: 'escrows', prefix: 'ESC', name: 'Escrow' },
      { table: 'listings', prefix: 'LST', name: 'Listing' },
      { table: 'clients', prefix: 'CLT', name: 'Client' },
      { table: 'leads', prefix: 'LED', name: 'Lead' },
      { table: 'appointments', prefix: 'APT', name: 'Appointment' },
      { table: 'invoices', prefix: 'INV', name: 'Invoice' },
      { table: 'commissions', prefix: 'COM', name: 'Commission' },
      { table: 'expenses', prefix: 'EXP', name: 'Expense' }
    ];
    
    // 1. First ensure teams table exists
    console.log('1️⃣ Ensuring teams table exists...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS teams (
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
    
    // Check if we have any teams
    const teamCheck = await client.query('SELECT COUNT(*) FROM teams');
    if (teamCheck.rows[0].count === '0') {
      // Create default team
      const teamResult = await client.query(`
        INSERT INTO teams (name, subdomain, settings)
        VALUES ('Jayden Metz Real Estate', 'jaydenmetz', '{"theme": "professional"}')
        RETURNING team_id
      `);
      console.log('✅ Default team created');
    }
    
    // 2. Add three-tier ID columns to all entity tables
    console.log('\n2️⃣ Adding three-tier ID columns to all entities...');
    
    for (const entity of entities) {
      console.log(`\n   Processing ${entity.name} table...`);
      
      // Check if table exists
      const tableExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = $1
        )
      `, [entity.table]);
      
      if (tableExists.rows[0].exists) {
        // Add columns if they don't exist
        await client.query(`
          ALTER TABLE ${entity.table} 
          ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(team_id),
          ADD COLUMN IF NOT EXISTS team_sequence_id INTEGER,
          ADD COLUMN IF NOT EXISTS display_id VARCHAR(20),
          ADD COLUMN IF NOT EXISTS global_id UUID DEFAULT gen_random_uuid()
        `);
        
        // Create indexes
        await client.query(`
          CREATE INDEX IF NOT EXISTS idx_${entity.table}_team_id ON ${entity.table}(team_id);
          CREATE INDEX IF NOT EXISTS idx_${entity.table}_global_id ON ${entity.table}(global_id);
          CREATE INDEX IF NOT EXISTS idx_${entity.table}_display_id ON ${entity.table}(team_id, display_id);
        `);
        
        console.log(`   ✅ ${entity.name} table updated`);
      } else {
        console.log(`   ⏭️  ${entity.name} table doesn't exist, skipping`);
      }
    }
    
    // 3. Create universal display ID generator function
    console.log('\n3️⃣ Creating universal display ID generator...');
    await client.query(`
      CREATE OR REPLACE FUNCTION generate_display_id(
        p_team_id UUID,
        p_table_name TEXT,
        p_prefix TEXT
      )
      RETURNS VARCHAR AS $$
      DECLARE
        v_year INTEGER;
        v_sequence INTEGER;
        v_display_id VARCHAR(20);
        v_query TEXT;
      BEGIN
        v_year := EXTRACT(YEAR FROM CURRENT_DATE);
        
        -- Build dynamic query to get next sequence
        v_query := format(
          'SELECT COALESCE(MAX(
            CAST(
              SUBSTRING(display_id FROM %L)
              AS INTEGER
            )
          ), 0) + 1
          FROM %I
          WHERE team_id = %L
          AND display_id LIKE %L',
          p_prefix || '-[0-9]{4}-([0-9]+)',
          p_table_name,
          p_team_id,
          p_prefix || '-' || v_year || '-%'
        );
        
        EXECUTE v_query INTO v_sequence;
        
        v_display_id := CONCAT(p_prefix, '-', v_year, '-', LPAD(v_sequence::TEXT, 3, '0'));
        
        RETURN v_display_id;
      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log('✅ Universal display ID generator created');
    
    // 4. Create function to get next team sequence ID
    console.log('\n4️⃣ Creating team sequence ID generator...');
    await client.query(`
      CREATE OR REPLACE FUNCTION get_next_team_sequence_id(
        p_team_id UUID,
        p_table_name TEXT
      )
      RETURNS INTEGER AS $$
      DECLARE
        v_next_id INTEGER;
        v_query TEXT;
      BEGIN
        v_query := format(
          'SELECT COALESCE(MAX(team_sequence_id), 0) + 1
          FROM %I
          WHERE team_id = %L',
          p_table_name,
          p_team_id
        );
        
        EXECUTE v_query INTO v_next_id;
        
        RETURN v_next_id;
      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log('✅ Team sequence ID generator created');
    
    // 5. Update existing data with IDs
    console.log('\n5️⃣ Updating existing records with three-tier IDs...');
    
    // Get default team
    const defaultTeam = await client.query(`
      SELECT team_id FROM teams WHERE subdomain = 'jaydenmetz' LIMIT 1
    `);
    
    if (defaultTeam.rows.length > 0) {
      const teamId = defaultTeam.rows[0].team_id;
      
      for (const entity of entities) {
        const tableExists = await client.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = $1
          )
        `, [entity.table]);
        
        if (tableExists.rows[0].exists) {
          // Assign team_id to records without one
          await client.query(`
            UPDATE ${entity.table}
            SET team_id = $1
            WHERE team_id IS NULL
          `, [teamId]);
          
          // Generate team_sequence_ids
          await client.query(`
            WITH numbered_records AS (
              SELECT 
                ${entity.table === 'clients' || entity.table === 'leads' ? 'id' : 'id'},
                ROW_NUMBER() OVER (PARTITION BY team_id ORDER BY created_at, id) as seq_num
              FROM ${entity.table}
              WHERE team_id = $1
            )
            UPDATE ${entity.table} e
            SET team_sequence_id = nr.seq_num
            FROM numbered_records nr
            WHERE e.id = nr.id
          `, [teamId]);
          
          // Generate display_ids
          await client.query(`
            UPDATE ${entity.table}
            SET display_id = generate_display_id(team_id, '${entity.table}', '${entity.prefix}')
            WHERE team_id = $1 AND display_id IS NULL
          `, [teamId]);
          
          // Ensure global_ids exist
          await client.query(`
            UPDATE ${entity.table}
            SET global_id = gen_random_uuid()
            WHERE global_id IS NULL
          `);
          
          const count = await client.query(`
            SELECT COUNT(*) FROM ${entity.table} WHERE team_id = $1
          `, [teamId]);
          
          console.log(`   ✅ Updated ${count.rows[0].count} ${entity.name} records`);
        }
      }
    }
    
    // 6. Create trigger for automatic ID generation
    console.log('\n6️⃣ Creating triggers for automatic ID generation...');
    await client.query(`
      CREATE OR REPLACE FUNCTION set_three_tier_ids()
      RETURNS TRIGGER AS $$
      DECLARE
        v_prefix TEXT;
      BEGIN
        -- Determine prefix based on table
        CASE TG_TABLE_NAME
          WHEN 'escrows' THEN v_prefix := 'ESC';
          WHEN 'listings' THEN v_prefix := 'LST';
          WHEN 'clients' THEN v_prefix := 'CLT';
          WHEN 'leads' THEN v_prefix := 'LED';
          WHEN 'appointments' THEN v_prefix := 'APT';
          WHEN 'invoices' THEN v_prefix := 'INV';
          WHEN 'commissions' THEN v_prefix := 'COM';
          WHEN 'expenses' THEN v_prefix := 'EXP';
          ELSE v_prefix := 'DOC';
        END CASE;
        
        -- Set IDs if not provided
        IF NEW.global_id IS NULL THEN
          NEW.global_id := gen_random_uuid();
        END IF;
        
        IF NEW.team_sequence_id IS NULL AND NEW.team_id IS NOT NULL THEN
          NEW.team_sequence_id := get_next_team_sequence_id(NEW.team_id, TG_TABLE_NAME);
        END IF;
        
        IF NEW.display_id IS NULL AND NEW.team_id IS NOT NULL THEN
          NEW.display_id := generate_display_id(NEW.team_id, TG_TABLE_NAME, v_prefix);
        END IF;
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    // Create triggers for each table
    for (const entity of entities) {
      const tableExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = $1
        )
      `, [entity.table]);
      
      if (tableExists.rows[0].exists) {
        await client.query(`
          DROP TRIGGER IF EXISTS set_ids_trigger ON ${entity.table};
          CREATE TRIGGER set_ids_trigger
          BEFORE INSERT ON ${entity.table}
          FOR EACH ROW
          EXECUTE FUNCTION set_three_tier_ids();
        `);
      }
    }
    console.log('✅ Triggers created for automatic ID generation');
    
    // 7. Show examples
    console.log('\n📊 Three-Tier ID System Examples:');
    
    for (const entity of entities.slice(0, 5)) { // Show first 5 entities
      const tableExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = $1
        )
      `, [entity.table]);
      
      if (tableExists.rows[0].exists) {
        const examples = await client.query(`
          SELECT 
            team_sequence_id as simple_id,
            display_id,
            SUBSTRING(global_id::TEXT, 1, 8) || '...' as global_id_short
          FROM ${entity.table}
          WHERE team_id IS NOT NULL
          ORDER BY team_sequence_id
          LIMIT 3
        `);
        
        if (examples.rows.length > 0) {
          console.log(`\n${entity.name}s:`);
          examples.rows.forEach(row => {
            console.log(`   #${row.simple_id} → ${row.display_id} → ${row.global_id_short}`);
          });
        }
      }
    }
    
    await client.query('COMMIT');
    
    console.log('\n✅ Universal three-tier ID system implemented!');
    console.log('\n🔢 ID System Summary:');
    console.log('   1. Simple ID: Team-specific sequential (1, 2, 3...)');
    console.log('   2. Display ID: Year-based reference (ESC-2025-001, LST-2025-001, etc.)');
    console.log('   3. Global ID: UUID unique across all teams and entities');
    console.log('\n📝 Prefixes:');
    entities.forEach(e => {
      console.log(`   ${e.prefix} = ${e.name}`);
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

implementUniversalIdSystem();