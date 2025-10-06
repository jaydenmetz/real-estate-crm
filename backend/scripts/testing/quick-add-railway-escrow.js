const { Pool } = require('pg');

// Get DATABASE_URL from Railway
// You need to set this as an environment variable
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ Please set DATABASE_URL environment variable');
  console.error('Get it from Railway: PostgreSQL service > Connect tab > Postgres Connection URL');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function addEscrow() {
  try {
    console.log('Connecting to Railway PostgreSQL...');
    
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Connected successfully!\n');

    // Add escrow
    const result = await pool.query(`
      INSERT INTO escrows (
        id,
        property_address,
        escrow_status,
        purchase_price,
        earnest_money_deposit,
        down_payment,
        loan_amount,
        commission_percentage,
        gross_commission,
        net_commission,
        acceptance_date,
        closing_date,
        property_type,
        lead_source
      )
      VALUES (
        'ESC-PROD-2025-001',
        '1234 Ocean View Boulevard, Santa Monica, CA 90401',
        'Active',
        2750000.00,
        27500.00,
        550000.00,
        2200000.00,
        2.5,
        68750.00,
        34375.00,
        '2025-07-15',
        '2025-08-28',
        'Single Family',
        'Referral'
      )
      ON CONFLICT (id) DO UPDATE SET
        property_address = EXCLUDED.property_address
      RETURNING id, property_address, purchase_price, escrow_status
    `);

    console.log('✅ Escrow added successfully!');
    console.log('📋 Details:', result.rows[0]);

    // Add buyer
    await pool.query(`
      INSERT INTO escrow_buyers (escrow_id, name, email, phone)
      VALUES ('ESC-PROD-2025-001', 'David Chen', 'david.chen@email.com', '(310) 555-1234')
      ON CONFLICT DO NOTHING
    `);
    console.log('✅ Buyer added');

    // Add seller  
    await pool.query(`
      INSERT INTO escrow_sellers (escrow_id, name, email, phone)
      VALUES ('ESC-PROD-2025-001', 'Jennifer Williams', 'jennifer.williams@email.com', '(310) 555-5678')
      ON CONFLICT DO NOTHING
    `);
    console.log('✅ Seller added');

    // Show total count
    const countResult = await pool.query('SELECT COUNT(*) as total FROM escrows');
    console.log(`\n📊 Total escrows in Railway database: ${countResult.rows[0].total}`);

    console.log('\n🎉 Done! Check https://crm.jaydenmetz.com/escrows to see your new escrow.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

addEscrow();