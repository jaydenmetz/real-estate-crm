const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const pool = new Pool({
  connectionString: process.env.RAILWAY_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function updateToFullPrefixes() {
  const client = await pool.connect();
  
  try {
    console.log('🔤 Updating to full entity prefixes...\n');
    
    await client.query('BEGIN');
    
    // Define old to new prefix mappings
    const prefixMappings = [
      { 
        table: 'escrows',
        oldPrefix: 'ESC',
        newPrefix: 'ESCROW',
        name: 'Escrow'
      },
      { 
        table: 'listings',
        oldPrefix: 'LST',
        newPrefix: 'LISTING',
        name: 'Listing'
      },
      { 
        table: 'clients',
        oldPrefix: 'CLT',
        newPrefix: 'CLIENT',
        name: 'Client'
      },
      { 
        table: 'leads',
        oldPrefix: 'LED',
        newPrefix: 'LEAD',
        name: 'Lead'
      },
      { 
        table: 'appointments',
        oldPrefix: 'APT',
        newPrefix: 'APPT',
        name: 'Appointment'
      }
    ];
    
    // 1. Update the prefixed UUID generator
    console.log('1️⃣ Updating prefixed UUID generator...');
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
        -- Use full prefix followed by hyphen for clarity
        RETURN v_prefix_lower || '-' || v_uuid_text;
      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log('✅ UUID generator updated');
    
    // 2. Update existing display IDs and global IDs
    console.log('\n2️⃣ Updating existing IDs to use full prefixes...');
    
    for (const mapping of prefixMappings) {
      try {
        // Update display_ids (ESC-2025-001 → ESCROW-2025-001)
        const displayUpdate = await client.query(`
          UPDATE ${mapping.table}
          SET display_id = REPLACE(display_id, '${mapping.oldPrefix}-', '${mapping.newPrefix}-')
          WHERE display_id LIKE '${mapping.oldPrefix}-%'
        `);
        
        // Update global_ids (esc-xxx → escrow-xxx)
        const globalUpdate = await client.query(`
          UPDATE ${mapping.table}
          SET global_id = REPLACE(global_id, '${mapping.oldPrefix.toLowerCase()}', '${mapping.newPrefix.toLowerCase()}')
          WHERE global_id LIKE '${mapping.oldPrefix.toLowerCase()}%'
        `);
        
        console.log(`   ✅ ${mapping.name}: Updated ${displayUpdate.rowCount} display IDs, ${globalUpdate.rowCount} global IDs`);
        
      } catch (error) {
        console.log(`   ⚠️  ${mapping.name}: ${error.message}`);
      }
    }
    
    // 3. Update the universal display ID generator
    console.log('\n3️⃣ Updating display ID generator function...');
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
    console.log('✅ Display ID generator updated');
    
    // 4. Update the trigger function
    console.log('\n4️⃣ Updating trigger function for new prefixes...');
    await client.query(`
      CREATE OR REPLACE FUNCTION set_three_tier_ids()
      RETURNS TRIGGER AS $$
      DECLARE
        v_prefix TEXT;
      BEGIN
        -- Determine prefix based on table
        CASE TG_TABLE_NAME
          WHEN 'escrows' THEN v_prefix := 'ESCROW';
          WHEN 'listings' THEN v_prefix := 'LISTING';
          WHEN 'clients' THEN v_prefix := 'CLIENT';
          WHEN 'leads' THEN v_prefix := 'LEAD';
          WHEN 'appointments' THEN v_prefix := 'APPT';
          WHEN 'invoices' THEN v_prefix := 'INVOICE';
          WHEN 'commissions' THEN v_prefix := 'COMMISSION';
          WHEN 'expenses' THEN v_prefix := 'EXPENSE';
          ELSE v_prefix := 'DOC';
        END CASE;
        
        -- Set IDs if not provided
        IF NEW.global_id IS NULL THEN
          NEW.global_id := generate_prefixed_uuid(v_prefix);
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
    console.log('✅ Trigger function updated');
    
    // 5. Show the updated examples
    console.log('\n📊 Updated Three-Tier ID System Examples:\n');
    
    for (const mapping of prefixMappings) {
      try {
        const examples = await client.query(`
          SELECT 
            team_sequence_id as "Simple ID",
            display_id as "Display ID",
            SUBSTRING(global_id, 1, 20) || '...' as "Global ID"
          FROM ${mapping.table}
          WHERE team_id IS NOT NULL
          ORDER BY team_sequence_id DESC
          LIMIT 2
        `);
        
        if (examples.rows.length > 0) {
          console.log(`${mapping.name}s:`);
          console.log('╔═══════════╤══════════════════════╤═══════════════════════════╗');
          console.log('║ Simple ID │ Display ID          │ Global ID                 ║');
          console.log('╠═══════════╪══════════════════════╪═══════════════════════════╣');
          examples.rows.forEach(row => {
            const simpleId = (row['Simple ID'] || '').toString().padEnd(9);
            const displayId = (row['Display ID'] || '').padEnd(20);
            const globalId = (row['Global ID'] || '').padEnd(25);
            console.log(`║ ${simpleId} │ ${displayId} │ ${globalId} ║`);
          });
          console.log('╚═══════════╧══════════════════════╧═══════════════════════════╝\n');
        }
      } catch (error) {
        // Skip if error
      }
    }
    
    // 6. Create a new example with the new format
    console.log('6️⃣ Creating new example with updated prefixes...');
    
    // Get team ID
    const teamResult = await client.query(`
      SELECT team_id FROM teams WHERE subdomain = 'jaydenmetz' LIMIT 1
    `);
    
    if (teamResult.rows.length > 0) {
      const teamId = teamResult.rows[0].team_id;
      
      try {
        // Create a new lead as an example
        await client.query(`
          INSERT INTO leads (
            id, team_id, 
            first_name, last_name, email, phone,
            lead_source, lead_status, created_at
          ) VALUES (
            gen_random_uuid(), $1,
            'Example', 'Lead', 'example@email.com', '555-0123',
            'Website', 'New', NOW()
          )
        `, [teamId]);
        
        console.log('✅ Created example lead with new ID format');
        
        // Show the new lead
        const newLead = await client.query(`
          SELECT team_sequence_id, display_id, global_id
          FROM leads
          WHERE email = 'example@email.com'
          LIMIT 1
        `);
        
        if (newLead.rows.length > 0) {
          const lead = newLead.rows[0];
          console.log(`\n   New Lead Created:`);
          console.log(`   Simple ID: ${lead.team_sequence_id}`);
          console.log(`   Display ID: ${lead.display_id}`);
          console.log(`   Global ID: ${lead.global_id}`);
        }
        
      } catch (error) {
        console.log('   ⏭️  Example creation skipped');
      }
    }
    
    await client.query('COMMIT');
    
    console.log('\n✅ Successfully updated to full prefixes!');
    console.log('\n🔤 New Prefix System:');
    console.log('   ESCROW-2025-001 (was ESC-2025-001)');
    console.log('   LISTING-2025-001 (was LST-2025-001)');
    console.log('   CLIENT-2025-001 (was CLT-2025-001)');
    console.log('   LEAD-2025-001 (was LED-2025-001)');
    console.log('   APPT-2025-001 (was APT-2025-001)');
    console.log('\n🆔 Global IDs now use full prefixes:');
    console.log('   escrow-550e8400-e29b-41d4...');
    console.log('   listing-6ba7b810-9dad-11d1...');
    console.log('   client-6ba7b811-9dad-11d1...');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

updateToFullPrefixes();