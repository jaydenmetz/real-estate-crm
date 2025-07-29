const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env.production') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function addEscrowCompanyFields() {
  const client = await pool.connect();
  
  try {
    console.log('Connected to production database');
    
    // Begin transaction
    await client.query('BEGIN');
    
    // Add columns if they don't exist
    console.log('Adding escrow company fields...');
    await client.query(`
      ALTER TABLE escrows 
      ADD COLUMN IF NOT EXISTS escrow_company VARCHAR(255),
      ADD COLUMN IF NOT EXISTS escrow_officer_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS escrow_officer_email VARCHAR(255),
      ADD COLUMN IF NOT EXISTS escrow_officer_phone VARCHAR(50),
      ADD COLUMN IF NOT EXISTS title_company VARCHAR(255),
      ADD COLUMN IF NOT EXISTS lender_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS loan_officer_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS loan_officer_email VARCHAR(255),
      ADD COLUMN IF NOT EXISTS loan_officer_phone VARCHAR(50),
      ADD COLUMN IF NOT EXISTS property_image_url TEXT
    `);
    
    console.log('Columns added successfully');
    
    // Update ESCROW-2025-0002 specifically
    const updateResult = await client.query(`
      UPDATE escrows 
      SET 
        escrow_company = 'Chicago Title',
        escrow_officer_name = 'Lisa Wilson',
        escrow_officer_email = 'lisa.wilson@chicagotitle.com',
        escrow_officer_phone = '(619) 555-0999',
        title_company = 'Chicago Title',
        lender_name = 'Bank of America',
        loan_officer_name = 'Sarah Thompson',
        loan_officer_email = 'sthompson@bofa.com',
        loan_officer_phone = '(858) 555-3002',
        property_image_url = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'
      WHERE display_id = 'ESCROW-2025-0002'
      RETURNING display_id, escrow_company, lender_name
    `);
    
    if (updateResult.rows.length > 0) {
      console.log('Updated ESCROW-2025-0002:', updateResult.rows[0]);
    }
    
    // Update other escrows with default values
    const updateOthersResult = await client.query(`
      UPDATE escrows 
      SET 
        escrow_company = COALESCE(escrow_company, 'First American Title'),
        escrow_officer_name = COALESCE(escrow_officer_name, 'Escrow Officer'),
        escrow_officer_email = COALESCE(escrow_officer_email, 'escrow@firstamerican.com'),
        escrow_officer_phone = COALESCE(escrow_officer_phone, '(619) 555-1000'),
        title_company = COALESCE(title_company, 'First American Title'),
        lender_name = COALESCE(lender_name, 'Wells Fargo Home Mortgage'),
        property_image_url = COALESCE(property_image_url, 
          CASE
            WHEN property_type = 'Condo' THEN 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'
            WHEN property_type = 'Single Family' THEN 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'
            WHEN property_type = 'Townhouse' THEN 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800'
            ELSE 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800'
          END
        )
      WHERE escrow_company IS NULL OR property_image_url IS NULL
    `);
    
    console.log(`Updated ${updateOthersResult.rowCount} other escrows with company data`);
    
    // Commit transaction
    await client.query('COMMIT');
    console.log('Transaction committed successfully');
    
    // Show final results
    const finalResult = await client.query(`
      SELECT 
        display_id,
        property_address,
        escrow_company,
        escrow_officer_name,
        title_company,
        lender_name,
        property_image_url
      FROM escrows
      WHERE display_id LIKE 'ESCROW-2025-%'
      ORDER BY display_id
      LIMIT 5
    `);
    
    console.log('\nFinal escrow company data:');
    finalResult.rows.forEach(row => {
      console.log(`${row.display_id}: ${row.escrow_company} / ${row.title_company} / ${row.lender_name}`);
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error adding escrow company fields:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the update
addEscrowCompanyFields()
  .then(() => {
    console.log('\nEscrow company fields added successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('\nUpdate failed:', error.message);
    process.exit(1);
  });