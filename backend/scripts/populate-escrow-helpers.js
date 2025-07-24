// Script to populate helper tables for existing escrows
const { Pool } = require('pg');
require('dotenv').config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local'
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function populateHelperTables() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Get all existing escrows
    const escrowsResult = await client.query('SELECT * FROM escrows WHERE deleted_at IS NULL');
    const escrows = escrowsResult.rows;
    
    console.log(`Found ${escrows.length} escrows to populate`);
    
    for (const escrow of escrows) {
      console.log(`\nProcessing escrow ${escrow.id}...`);
      
      // Check if helper data already exists
      const checkResult = await client.query(
        'SELECT COUNT(*) as count FROM escrow_checklists WHERE escrow_id = $1',
        [escrow.id]
      );
      
      if (checkResult.rows[0].count > 0) {
        console.log(`  - Skipping ${escrow.id}, already has helper data`);
        continue;
      }
      
      // Create checklist items from templates
      await client.query(`
        INSERT INTO escrow_checklists (escrow_id, phase, task_name, task_description, task_order, due_date)
        SELECT $1, phase, task_name, task_description, task_order, 
               CASE WHEN default_days_from_start >= 0 
                    THEN $2::date + (default_days_from_start || ' days')::interval
                    ELSE $3::date + (default_days_from_start || ' days')::interval
               END
        FROM checklist_templates
        ORDER BY task_order
      `, [escrow.id, escrow.acceptance_date || escrow.created_at, escrow.closing_date]);
      console.log('  ✓ Created checklist items');
      
      // Create financial entries
      await client.query(`
        INSERT INTO escrow_financials (escrow_id, category, item_name, amount, percentage)
        VALUES 
          ($1, 'income', 'Purchase Price', $2, 100),
          ($1, 'expense', 'Earnest Money Deposit', $3, NULL),
          ($1, 'commission', 'Gross Commission', $4, $5),
          ($1, 'commission', 'My Commission', $6, $7)
      `, [
        escrow.id,
        escrow.purchase_price || 0,
        escrow.earnest_money_deposit || 0,
        escrow.gross_commission || 0,
        escrow.commission_percentage || 2.5,
        escrow.net_commission || 0,
        (escrow.commission_percentage || 2.5) / 2
      ]);
      console.log('  ✓ Created financial entries');
      
      // Create timeline entries (using existing schema)
      await client.query(`
        INSERT INTO escrow_timeline (escrow_id, event_date, event_type, description, metadata)
        VALUES ($1, $2, 'milestone', 'Escrow Created - New escrow initiated', '{"icon": "start", "title": "Escrow Created"}'::jsonb)
      `, [escrow.id, escrow.created_at]);
      
      if (escrow.acceptance_date) {
        await client.query(`
          INSERT INTO escrow_timeline (escrow_id, event_date, event_type, description, metadata)
          VALUES ($1, $2, 'milestone', 'Offer Accepted - Purchase agreement signed', '{"icon": "check", "title": "Offer Accepted"}'::jsonb)
        `, [escrow.id, escrow.acceptance_date]);
      }
      console.log('  ✓ Created timeline entries');
      
      // Create sample participants (optional, can be updated later)
      await client.query(`
        INSERT INTO escrow_participants (escrow_id, role, name, email, phone, is_primary)
        VALUES 
          ($1, 'buyer', 'TBD - Buyer', 'buyer@example.com', '555-0100', true),
          ($1, 'seller', 'TBD - Seller', 'seller@example.com', '555-0200', true),
          ($1, 'buyer_agent', 'Jayden Metz', 'realtor@jaydenmetz.com', '(661) 747-0853', true),
          ($1, 'escrow_officer', 'TBD - Escrow Officer', 'escrow@titlecompany.com', '555-0300', true)
      `, [escrow.id]);
      console.log('  ✓ Created placeholder participants');
    }
    
    await client.query('COMMIT');
    console.log('\n✅ Successfully populated helper tables for all escrows');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error populating helper tables:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the script
populateHelperTables()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));