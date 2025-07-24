require('dotenv').config({ path: '.env.production' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function addProductionEscrows() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Disable the trigger temporarily
    await client.query('ALTER TABLE escrows DISABLE TRIGGER escrow_id_trigger');
    
    // Three unique escrows for production
    const escrows = [
      {
        display_id: 'ESC-2025-0001',
        property_address: '789 Pacific Coast Highway, Malibu, CA 90265 - PRODUCTION',
        escrow_status: 'Active',
        purchase_price: 3500000,
        earnest_money_deposit: 105000,
        down_payment: 700000,
        loan_amount: 2800000,
        commission_percentage: 2.5,
        gross_commission: 87500,
        net_commission: 43750,
        acceptance_date: '2025-01-20',
        closing_date: '2025-02-28',
        property_type: 'Luxury Home',
        lead_source: 'Referral'
      },
      {
        display_id: 'ESC-2025-0002',
        property_address: '456 Market Street, San Francisco, CA 94105 - PRODUCTION',
        escrow_status: 'Active',
        purchase_price: 1200000,
        earnest_money_deposit: 36000,
        down_payment: 240000,
        loan_amount: 960000,
        commission_percentage: 2.5,
        gross_commission: 30000,
        net_commission: 15000,
        acceptance_date: '2025-01-18',
        closing_date: '2025-02-25',
        property_type: 'Condo',
        lead_source: 'Website'
      },
      {
        display_id: 'ESC-2025-0003',
        property_address: '321 Sunset Boulevard, Beverly Hills, CA 90210 - PRODUCTION',
        escrow_status: 'Pending',
        purchase_price: 5750000,
        earnest_money_deposit: 287500,
        down_payment: 1725000,
        loan_amount: 4025000,
        commission_percentage: 2.5,
        gross_commission: 143750,
        net_commission: 71875,
        acceptance_date: '2025-01-22',
        closing_date: '2025-03-15',
        property_type: 'Estate',
        lead_source: 'Agent Network'
      }
    ];
    
    console.log('Adding escrows to production database...\n');
    
    for (let i = 0; i < escrows.length; i++) {
      const escrow = escrows[i];
      
      // Insert escrow
      await client.query(`
        INSERT INTO escrows (
          display_id, property_address, escrow_status, purchase_price,
          earnest_money_deposit, down_payment, loan_amount,
          commission_percentage, gross_commission, net_commission,
          acceptance_date, closing_date, property_type, lead_source,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
        ON CONFLICT (display_id) DO NOTHING
      `, [
        escrow.display_id,
        escrow.property_address,
        escrow.escrow_status,
        escrow.purchase_price,
        escrow.earnest_money_deposit,
        escrow.down_payment,
        escrow.loan_amount,
        escrow.commission_percentage,
        escrow.gross_commission,
        escrow.net_commission,
        escrow.acceptance_date,
        escrow.closing_date,
        escrow.property_type,
        escrow.lead_source
      ]);
      
      console.log(`✅ Created escrow ${escrow.display_id}`);
      console.log(`   Address: ${escrow.property_address}`);
      console.log(`   Price: $${escrow.purchase_price.toLocaleString()}`);
      console.log(`   Status: ${escrow.escrow_status}\n`);
      
      // Add basic people (only if escrow_people exists)
      try {
        await client.query(`
          INSERT INTO escrow_people (escrow_display_id, person_type, name, email, phone, company)
          VALUES 
            ($1, 'buyer', 'Production Buyer ${i + 1}', 'buyer${i + 1}@production.com', '555-100${i + 1}', NULL),
            ($1, 'seller', 'Production Seller ${i + 1}', 'seller${i + 1}@production.com', '555-200${i + 1}', NULL),
            ($1, 'buyer_agent', 'Jayden Metz', 'realtor@jaydenmetz.com', '(661) 747-0853', 'Metz Realty'),
            ($1, 'listing_agent', 'Production Agent ${i + 1}', 'agent${i + 1}@production.com', '555-300${i + 1}', 'Production Realty')
          ON CONFLICT DO NOTHING
        `, [escrow.display_id]);
        console.log(`   ✓ Added people`)
      } catch (e) {
        console.log(`   ⚠️  Skipped people (table may not match local schema)`)
      }
    }
    
    // Re-enable the trigger
    await client.query('ALTER TABLE escrows ENABLE TRIGGER escrow_id_trigger');
    
    await client.query('COMMIT');
    console.log('✅ Successfully added 3 escrows to production database!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

addProductionEscrows();