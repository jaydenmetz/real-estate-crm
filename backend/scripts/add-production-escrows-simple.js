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
      
      // Add default people
      await client.query(`
        INSERT INTO escrow_people (escrow_display_id, person_type, name, email, phone, company)
        VALUES 
          ($1, 'buyer', 'Production Buyer ${i + 1}', 'buyer${i + 1}@production.com', '555-100${i + 1}', NULL),
          ($1, 'seller', 'Production Seller ${i + 1}', 'seller${i + 1}@production.com', '555-200${i + 1}', NULL),
          ($1, 'buyer_agent', 'Jayden Metz', 'realtor@jaydenmetz.com', '(661) 747-0853', 'Metz Realty'),
          ($1, 'listing_agent', 'Production Agent ${i + 1}', 'agent${i + 1}@production.com', '555-300${i + 1}', 'Production Realty')
      `, [escrow.display_id]);
      
      // Add timeline events (sample - 5 key events)
      const acceptanceDate = new Date(escrow.acceptance_date);
      const closingDate = new Date(escrow.closing_date);
      
      await client.query(`
        INSERT INTO escrow_timeline (escrow_display_id, event_name, event_description, event_type, scheduled_date, completed_date, is_completed, is_critical, responsible_party, order_index)
        VALUES 
          ($1, 'Offer Accepted', 'Purchase offer accepted by seller', 'milestone', $2, $2, true, true, 'Listing Agent', 1),
          ($1, 'Earnest Money Deposited', 'Earnest money received in escrow', 'milestone', $3, $3, true, true, 'Buyer', 2),
          ($1, 'Home Inspection', 'Property inspection scheduled', 'inspection', $4, NULL, false, true, 'Buyer', 3),
          ($1, 'Loan Approval', 'Final loan approval due', 'deadline', $5, NULL, false, true, 'Lender', 4),
          ($1, 'Closing', 'Scheduled closing date', 'milestone', $6, NULL, false, true, 'All Parties', 5)
      `, [
        escrow.display_id,
        acceptanceDate,
        new Date(acceptanceDate.getTime() + 3 * 24 * 60 * 60 * 1000),
        new Date(acceptanceDate.getTime() + 10 * 24 * 60 * 60 * 1000),
        new Date(closingDate.getTime() - 7 * 24 * 60 * 60 * 1000),
        closingDate
      ]);
      
      // Add financial items (key items)
      await client.query(`
        INSERT INTO escrow_financials (escrow_display_id, item_name, item_category, amount, party_responsible, party_receiving, calculation_basis, is_estimate, order_index)
        VALUES 
          ($1, 'Purchase Price', 'income', $2, 'buyer', 'seller', 'Contract price', false, 1),
          ($1, 'Earnest Money Deposit', 'credit', $3, 'buyer', 'escrow', '3% of purchase price', false, 2),
          ($1, 'Down Payment', 'credit', $4, 'buyer', 'escrow', '20% of purchase price', false, 3),
          ($1, 'Agent Commission', 'expense', $5, 'seller', 'agents', '2.5% of purchase price', false, 4),
          ($1, 'Seller Net Proceeds', 'income', $6, 'seller', 'seller', 'Purchase price minus costs', true, 5)
      `, [
        escrow.display_id,
        escrow.purchase_price,
        escrow.earnest_money_deposit,
        escrow.down_payment,
        -escrow.gross_commission,
        escrow.purchase_price - escrow.gross_commission - 2000
      ]);
      
      // Add document checklist (key documents)
      await client.query(`
        INSERT INTO escrow_documents (escrow_display_id, document_name, document_type, document_status, is_required, due_date, order_index)
        VALUES 
          ($1, 'Purchase Agreement', 'contract', 'completed', true, $2, 1),
          ($1, 'Property Disclosures', 'disclosure', 'pending', true, $3, 2),
          ($1, 'Home Inspection Report', 'inspection', 'pending', false, $4, 3),
          ($1, 'Loan Approval Letter', 'financial', 'pending', true, $5, 4),
          ($1, 'Closing Statement', 'financial', 'pending', true, $6, 5)
      `, [
        escrow.display_id,
        acceptanceDate,
        new Date(acceptanceDate.getTime() + 5 * 24 * 60 * 60 * 1000),
        new Date(acceptanceDate.getTime() + 14 * 24 * 60 * 60 * 1000),
        new Date(closingDate.getTime() - 7 * 24 * 60 * 60 * 1000),
        new Date(closingDate.getTime() - 1 * 24 * 60 * 60 * 1000)
      ]);
    }
    
    // Re-enable the trigger
    await client.query('ALTER TABLE escrows ENABLE TRIGGER escrow_id_trigger');
    
    await client.query('COMMIT');
    console.log('✅ Successfully added 3 escrows to production database with all helper data!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

addProductionEscrows();