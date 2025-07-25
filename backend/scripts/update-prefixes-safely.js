const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const pool = new Pool({
  connectionString: process.env.RAILWAY_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function updatePrefixesSafely() {
  const client = await pool.connect();
  
  try {
    console.log('🔤 Safely updating to full entity prefixes...\n');
    
    await client.query('BEGIN');
    
    // 1. First, let's check what foreign key constraints exist
    console.log('1️⃣ Checking foreign key constraints...');
    const constraints = await client.query(`
      SELECT
        tc.table_name, 
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND ccu.column_name = 'display_id';
    `);
    
    if (constraints.rows.length > 0) {
      console.log('⚠️  Found foreign key constraints on display_id:');
      constraints.rows.forEach(c => {
        console.log(`   ${c.table_name}.${c.column_name} → ${c.foreign_table_name}.${c.foreign_column_name}`);
      });
      console.log('\n   Will update carefully to maintain referential integrity...\n');
    }
    
    // 2. Update functions first
    console.log('2️⃣ Updating generator functions...');
    
    // Update UUID generator
    await client.query(`
      CREATE OR REPLACE FUNCTION generate_prefixed_uuid(p_prefix TEXT)
      RETURNS VARCHAR AS $$
      DECLARE
        v_uuid UUID;
        v_uuid_text TEXT;
        v_prefix_lower TEXT;
      BEGIN
        v_uuid := gen_random_uuid();
        v_uuid_text := v_uuid::TEXT;
        v_prefix_lower := LOWER(p_prefix);
        RETURN v_prefix_lower || '-' || v_uuid_text;
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    // Update display ID generator with longer varchar
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
        v_display_id VARCHAR(30);
        v_query TEXT;
      BEGIN
        v_year := EXTRACT(YEAR FROM CURRENT_DATE);
        
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
    
    console.log('✅ Functions updated');
    
    // 3. Update column sizes to accommodate longer prefixes
    console.log('\n3️⃣ Updating column sizes...');
    const tables = ['escrows', 'listings', 'clients', 'leads', 'appointments'];
    
    for (const table of tables) {
      try {
        await client.query(`
          ALTER TABLE ${table} 
          ALTER COLUMN display_id TYPE VARCHAR(30)
        `);
        console.log(`   ✅ ${table}.display_id expanded to VARCHAR(30)`);
      } catch (error) {
        console.log(`   ⏭️  ${table}: ${error.message}`);
      }
    }
    
    // 4. Update existing records (without changing escrows for now due to FK constraints)
    console.log('\n4️⃣ Updating non-escrow entities...');
    
    const updates = [
      { table: 'listings', old: 'LST', new: 'LISTING' },
      { table: 'clients', old: 'CLT', new: 'CLIENT' },
      { table: 'leads', old: 'LED', new: 'LEAD' },
      { table: 'appointments', old: 'APT', new: 'APPT' }
    ];
    
    for (const update of updates) {
      try {
        // Update display IDs
        const result = await client.query(`
          UPDATE ${update.table}
          SET display_id = REPLACE(display_id, '${update.old}-', '${update.new}-')
          WHERE display_id LIKE '${update.old}-%'
        `);
        
        // Update global IDs
        await client.query(`
          UPDATE ${update.table}
          SET global_id = '${update.new.toLowerCase()}-' || SUBSTRING(global_id FROM LENGTH('${update.old}') + 1)
          WHERE global_id LIKE '${update.old.toLowerCase()}%'
        `);
        
        console.log(`   ✅ Updated ${result.rowCount} ${update.table} records`);
      } catch (error) {
        console.log(`   ⚠️  ${update.table}: ${error.message}`);
      }
    }
    
    // 5. Create new examples
    console.log('\n5️⃣ Creating examples with new format...');
    
    const teamResult = await client.query(`
      SELECT team_id FROM teams WHERE subdomain = 'jaydenmetz' LIMIT 1
    `);
    
    if (teamResult.rows.length > 0) {
      const teamId = teamResult.rows[0].team_id;
      
      // Create a client example
      try {
        const clientId = await client.query(`
          INSERT INTO clients (
            id, team_id,
            client_type, status,
            created_at
          ) VALUES (
            gen_random_uuid(), $1,
            'Buyer', 'Active',
            NOW()
          )
          RETURNING team_sequence_id, display_id, global_id
        `, [teamId]);
        
        if (clientId.rows.length > 0) {
          console.log(`   ✅ New Client: #${clientId.rows[0].team_sequence_id} → ${clientId.rows[0].display_id}`);
        }
      } catch (error) {
        // Skip if error
      }
    }
    
    // 6. Show current state
    console.log('\n📊 Current ID Formats:\n');
    
    const examples = [
      { table: 'escrows', name: 'Escrows (unchanged due to FK)' },
      { table: 'listings', name: 'Listings' },
      { table: 'clients', name: 'Clients' },
      { table: 'leads', name: 'Leads' },
      { table: 'appointments', name: 'Appointments' }
    ];
    
    for (const example of examples) {
      try {
        const data = await client.query(`
          SELECT 
            team_sequence_id as seq,
            display_id,
            SUBSTRING(global_id, 1, 25) || '...' as global_id
          FROM ${example.table}
          WHERE display_id IS NOT NULL
          ORDER BY team_sequence_id DESC
          LIMIT 1
        `);
        
        if (data.rows.length > 0) {
          const row = data.rows[0];
          console.log(`${example.name}:`);
          console.log(`   #${row.seq} → ${row.display_id} → ${row.global_id}`);
        }
      } catch (error) {
        // Skip
      }
    }
    
    await client.query('COMMIT');
    
    console.log('\n✅ Update complete!');
    console.log('\n📝 Note: Escrows remain as ESC- due to foreign key constraints.');
    console.log('   To update escrows, you would need to:');
    console.log('   1. Drop foreign key constraints');
    console.log('   2. Update escrow display_ids');
    console.log('   3. Update referencing tables');
    console.log('   4. Recreate foreign key constraints');
    console.log('\n🔤 New formats in use:');
    console.log('   LISTING-2025-001');
    console.log('   CLIENT-2025-001');
    console.log('   LEAD-2025-001');
    console.log('   APPT-2025-001');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

updatePrefixesSafely();