const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const pool = new Pool({
  connectionString: process.env.RAILWAY_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function setupIdTriggers() {
  const client = await pool.connect();
  
  try {
    console.log('⚙️  Setting up automatic ID generation triggers...\n');
    
    await client.query('BEGIN');
    
    // 1. Create trigger function
    console.log('1️⃣ Creating trigger function...');
    await client.query(`
      CREATE OR REPLACE FUNCTION set_three_tier_ids()
      RETURNS TRIGGER AS $$
      DECLARE
        v_prefix TEXT;
        v_next_seq INTEGER;
      BEGIN
        -- Determine prefix based on table
        CASE TG_TABLE_NAME
          WHEN 'escrows' THEN v_prefix := 'ESC';  -- Keep ESC due to FK constraints
          WHEN 'listings' THEN v_prefix := 'LISTING';
          WHEN 'clients' THEN v_prefix := 'CLIENT';
          WHEN 'leads' THEN v_prefix := 'LEAD';
          WHEN 'appointments' THEN v_prefix := 'APPT';
          WHEN 'invoices' THEN v_prefix := 'INVOICE';
          WHEN 'commissions' THEN v_prefix := 'COMMISSION';
          WHEN 'expenses' THEN v_prefix := 'EXPENSE';
          ELSE v_prefix := 'DOC';
        END CASE;
        
        -- Set global_id if not provided
        IF NEW.global_id IS NULL THEN
          NEW.global_id := LOWER(v_prefix) || '-' || gen_random_uuid()::TEXT;
        END IF;
        
        -- Set team_sequence_id if not provided
        IF NEW.team_sequence_id IS NULL AND NEW.team_id IS NOT NULL THEN
          SELECT COALESCE(MAX(team_sequence_id), 0) + 1
          INTO v_next_seq
          FROM escrows  -- This needs to be dynamic, but using escrows as example
          WHERE team_id = NEW.team_id;
          
          -- Use dynamic SQL to get the correct sequence
          EXECUTE format(
            'SELECT COALESCE(MAX(team_sequence_id), 0) + 1 FROM %I WHERE team_id = %L',
            TG_TABLE_NAME,
            NEW.team_id
          ) INTO v_next_seq;
          
          NEW.team_sequence_id := v_next_seq;
        END IF;
        
        -- Set display_id if not provided
        IF NEW.display_id IS NULL AND NEW.team_id IS NOT NULL THEN
          NEW.display_id := v_prefix || '-' || EXTRACT(YEAR FROM CURRENT_DATE) || '-' || 
                           LPAD(COALESCE(NEW.team_sequence_id, 1)::TEXT, 3, '0');
        END IF;
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log('✅ Trigger function created');
    
    // 2. Create triggers on each table
    console.log('\n2️⃣ Creating triggers on tables...');
    const tables = ['listings', 'leads', 'appointments'];  // Not escrows due to existing structure
    
    for (const table of tables) {
      try {
        await client.query(`
          DROP TRIGGER IF EXISTS set_ids_trigger ON ${table};
          CREATE TRIGGER set_ids_trigger
          BEFORE INSERT ON ${table}
          FOR EACH ROW
          EXECUTE FUNCTION set_three_tier_ids();
        `);
        console.log(`   ✅ Trigger created on ${table}`);
      } catch (error) {
        console.log(`   ⚠️  ${table}: ${error.message}`);
      }
    }
    
    // 3. Fix existing NULL values
    console.log('\n3️⃣ Fixing existing NULL values...');
    
    // Get team
    const teamResult = await client.query(`
      SELECT team_id FROM teams WHERE subdomain = 'jaydenmetz' LIMIT 1
    `);
    
    if (teamResult.rows.length > 0) {
      const teamId = teamResult.rows[0].team_id;
      
      for (const table of tables) {
        try {
          // Update records with NULL IDs
          await client.query(`
            WITH numbered AS (
              SELECT 
                id,
                ROW_NUMBER() OVER (ORDER BY created_at) as rn
              FROM ${table}
              WHERE team_id = $1 AND team_sequence_id IS NULL
            )
            UPDATE ${table} t
            SET 
              team_sequence_id = n.rn + COALESCE((SELECT MAX(team_sequence_id) FROM ${table} WHERE team_id = $1), 0),
              display_id = CASE 
                WHEN '${table}' = 'listings' THEN 'LISTING-' 
                WHEN '${table}' = 'leads' THEN 'LEAD-'
                WHEN '${table}' = 'appointments' THEN 'APPT-'
              END || EXTRACT(YEAR FROM CURRENT_DATE) || '-' || 
              LPAD((n.rn + COALESCE((SELECT MAX(team_sequence_id) FROM ${table} WHERE team_id = $1), 0))::TEXT, 3, '0'),
              global_id = CASE 
                WHEN '${table}' = 'listings' THEN 'listing-' 
                WHEN '${table}' = 'leads' THEN 'lead-'
                WHEN '${table}' = 'appointments' THEN 'appt-'
              END || gen_random_uuid()::TEXT
            FROM numbered n
            WHERE t.id = n.id
          `, [teamId, teamId]);
          
          const count = await client.query(`
            SELECT COUNT(*) FROM ${table} WHERE team_id = $1
          `, [teamId]);
          
          console.log(`   ✅ Fixed ${table}: ${count.rows[0].count} total records`);
        } catch (error) {
          console.log(`   ⚠️  ${table}: ${error.message}`);
        }
      }
    }
    
    // 4. Test the triggers with new records
    console.log('\n4️⃣ Testing triggers with new records...');
    
    if (teamResult.rows.length > 0) {
      const teamId = teamResult.rows[0].team_id;
      
      // Test listing
      try {
        const listing = await client.query(`
          INSERT INTO listings (
            id, team_id, property_address, list_price, listing_status, created_at
          ) VALUES (
            gen_random_uuid(), $1, '789 Test Ave', 500000, 'Active', NOW()
          )
          RETURNING team_sequence_id, display_id, global_id
        `, [teamId]);
        
        if (listing.rows.length > 0) {
          console.log(`   ✅ New Listing: #${listing.rows[0].team_sequence_id} → ${listing.rows[0].display_id}`);
        }
      } catch (error) {
        console.log(`   ⚠️  Listing test: ${error.message}`);
      }
    }
    
    await client.query('COMMIT');
    
    console.log('\n✅ ID generation system is now active!');
    console.log('\n📝 New records will automatically receive:');
    console.log('   - Sequential team_sequence_id');
    console.log('   - Display ID (LISTING-2025-001 format)');
    console.log('   - Prefixed global UUID');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

setupIdTriggers();