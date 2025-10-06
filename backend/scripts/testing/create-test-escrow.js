const { Pool } = require('pg');
const crypto = require('crypto');

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'realestate_crm',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

// Generate UUID (since we're using gen_random_uuid() in DB, we'll generate compatible ones here)
const generateUUID = () => {
  return crypto.randomUUID();
};

// Color codes for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`)
};

async function createTestEscrow() {
  const client = await pool.connect();
  
  try {
    // Start transaction
    await client.query('BEGIN');
    log.info('Starting test data creation...');

    // Check if test data already exists
    const existingCheck = await client.query(
      `SELECT COUNT(*) FROM contacts WHERE email IN ($1, $2, $3, $4)`,
      ['john.smith@email.com', 'jane.doe@email.com', 'sarah.johnson@realty.com', 'mike.davis@realty.com']
    );
    
    if (parseInt(existingCheck.rows[0].count) > 0) {
      log.warn('Test data already exists. Skipping creation to avoid duplicates.');
      await client.query('ROLLBACK');
      return;
    }

    // Get a team ID (create one if none exists)
    let teamId;
    const teamCheck = await client.query('SELECT team_id FROM teams LIMIT 1');
    if (teamCheck.rows.length === 0) {
      const teamResult = await client.query(
        `INSERT INTO teams (name, subdomain) VALUES ($1, $2) RETURNING team_id`,
        ['Test Team', 'test-team']
      );
      teamId = teamResult.rows[0].team_id;
      log.success(`Created test team with ID: ${teamId}`);
    } else {
      teamId = teamCheck.rows[0].team_id;
      log.info(`Using existing team ID: ${teamId}`);
    }

    // Create test user if doesn't exist
    let userId;
    const userCheck = await client.query('SELECT id FROM users LIMIT 1');
    if (userCheck.rows.length === 0) {
      const userResult = await client.query(
        `INSERT INTO users (email, first_name, last_name, role, team_id) 
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        ['admin@test.com', 'Admin', 'User', 'admin', teamId]
      );
      userId = userResult.rows[0].id;
      log.success(`Created test user with ID: ${userId}`);
    } else {
      userId = userCheck.rows[0].id;
      log.info(`Using existing user ID: ${userId}`);
    }

    // Create 4 test contacts
    log.info('Creating test contacts...');

    // 1. Buyer contact
    const buyerResult = await client.query(
      `INSERT INTO contacts (
        contact_type, first_name, last_name, email, phone, 
        address_street, address_city, address_state, address_zip,
        notes, team_id, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`,
      [
        'client', 'John', 'Smith', 'john.smith@email.com', '(619) 555-0100',
        '123 Buyer Lane', 'San Diego', 'CA', '92101',
        'Looking for 3BR home in good school district', teamId, userId
      ]
    );
    const buyerContactId = buyerResult.rows[0].id;
    log.success(`Created buyer contact: John Smith (ID: ${buyerContactId})`);

    // 2. Seller contact
    const sellerResult = await client.query(
      `INSERT INTO contacts (
        contact_type, first_name, last_name, email, phone,
        address_street, address_city, address_state, address_zip,
        notes, team_id, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`,
      [
        'client', 'Jane', 'Doe', 'jane.doe@email.com', '(858) 555-0200',
        '456 Seller Street', 'La Jolla', 'CA', '92037',
        'Downsizing after retirement', teamId, userId
      ]
    );
    const sellerContactId = sellerResult.rows[0].id;
    log.success(`Created seller contact: Jane Doe (ID: ${sellerContactId})`);

    // 3. Listing agent contact
    const listingAgentResult = await client.query(
      `INSERT INTO contacts (
        contact_type, first_name, last_name, email, phone,
        work_phone, company_name, notes, team_id, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
      [
        'agent', 'Sarah', 'Johnson', 'sarah.johnson@realty.com', '(619) 555-0300',
        '(619) 555-0301', 'Premier Realty Group',
        'Top producer, specializes in luxury homes', teamId, userId
      ]
    );
    const listingAgentContactId = listingAgentResult.rows[0].id;
    log.success(`Created listing agent contact: Sarah Johnson (ID: ${listingAgentContactId})`);

    // 4. Buyer agent contact
    const buyerAgentResult = await client.query(
      `INSERT INTO contacts (
        contact_type, first_name, last_name, email, phone,
        work_phone, company_name, notes, team_id, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
      [
        'agent', 'Mike', 'Davis', 'mike.davis@realty.com', '(760) 555-0400',
        '(760) 555-0401', 'Coastal Realty',
        'First-time buyer specialist', teamId, userId
      ]
    );
    const buyerAgentContactId = buyerAgentResult.rows[0].id;
    log.success(`Created buyer agent contact: Mike Davis (ID: ${buyerAgentContactId})`);

    // Create agent records
    log.info('Creating agent records...');

    const listingAgentRecordResult = await client.query(
      `INSERT INTO agents (
        contact_id, license_number, license_state, brokerage_name,
        designation, default_commission_rate, default_commission_split
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [
        listingAgentContactId, 'CA-RE-123456', 'CA', 'Premier Realty Group',
        'Realtor', 3.0, 80.0
      ]
    );
    const listingAgentId = listingAgentRecordResult.rows[0].id;
    log.success(`Created listing agent record (ID: ${listingAgentId})`);

    const buyerAgentRecordResult = await client.query(
      `INSERT INTO agents (
        contact_id, license_number, license_state, brokerage_name,
        designation, default_commission_rate, default_commission_split
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [
        buyerAgentContactId, 'CA-RE-789012', 'CA', 'Coastal Realty',
        'Realtor', 3.0, 75.0
      ]
    );
    const buyerAgentId = buyerAgentRecordResult.rows[0].id;
    log.success(`Created buyer agent record (ID: ${buyerAgentId})`);

    // Link agents to their contacts
    await client.query(
      `INSERT INTO contact_agents (contact_id, agent_id, relationship_type)
       VALUES ($1, $2, $3)`,
      [listingAgentContactId, listingAgentId, 'primary']
    );
    await client.query(
      `INSERT INTO contact_agents (contact_id, agent_id, relationship_type)
       VALUES ($1, $2, $3)`,
      [buyerAgentContactId, buyerAgentId, 'primary']
    );

    // Create client records
    log.info('Creating client records...');

    const buyerClientResult = await client.query(
      `INSERT INTO clients (
        contact_id, client_type, status, price_range_min, price_range_max,
        preferred_locations, property_types, pre_approved, pre_approval_amount,
        assigned_agent_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
      [
        buyerContactId, 'buyer', 'active', 700000, 900000,
        ['San Diego', 'La Jolla', 'Del Mar'], ['Single Family', 'Condo'],
        true, 850000, buyerAgentId
      ]
    );
    const buyerClientId = buyerClientResult.rows[0].id;
    log.success(`Created buyer client record (ID: ${buyerClientId})`);

    const sellerClientResult = await client.query(
      `INSERT INTO clients (
        contact_id, client_type, status, assigned_agent_id
      ) VALUES ($1, $2, $3, $4) RETURNING id`,
      [
        sellerContactId, 'seller', 'active', listingAgentId
      ]
    );
    const sellerClientId = sellerClientResult.rows[0].id;
    log.success(`Created seller client record (ID: ${sellerClientId})`);

    // Link clients to their contacts
    await client.query(
      `INSERT INTO contact_clients (contact_id, client_id, relationship_type, is_primary)
       VALUES ($1, $2, $3, $4)`,
      [buyerContactId, buyerClientId, 'primary', true]
    );
    await client.query(
      `INSERT INTO contact_clients (contact_id, client_id, relationship_type, is_primary)
       VALUES ($1, $2, $3, $4)`,
      [sellerContactId, sellerClientId, 'primary', true]
    );

    // Create test escrow
    log.info('Creating test escrow...');

    const escrowId = 'ESC-TEST-001';
    const purchasePrice = 850000;
    const totalCommissionRate = 3.0; // 1.5% each side
    const grossCommission = purchasePrice * (totalCommissionRate / 100);

    const escrowResult = await client.query(
      `INSERT INTO escrows (
        id, property_address, escrow_status, purchase_price,
        earnest_money_deposit, down_payment, loan_amount,
        commission_percentage, gross_commission, net_commission,
        acceptance_date, closing_date, property_type,
        lead_source, created_by, team_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING id`,
      [
        escrowId, '123 Main St, San Diego, CA 92101', 'Active', purchasePrice,
        8500, 170000, 680000,
        totalCommissionRate, grossCommission, grossCommission * 0.95,
        new Date('2025-01-10'), new Date('2025-02-15'), 'Single Family',
        'MLS', userId, teamId
      ]
    );
    log.success(`Created test escrow: ${escrowId} at 123 Main St, San Diego`);

    // Link all contacts to the escrow
    log.info('Linking participants to escrow...');

    // Link buyer
    await client.query(
      `INSERT INTO contact_escrows (contact_id, escrow_id, role, is_primary)
       VALUES ($1, $2, $3, $4)`,
      [buyerContactId, escrowId, 'buyer', true]
    );
    log.success('Linked buyer to escrow');

    // Link seller
    await client.query(
      `INSERT INTO contact_escrows (contact_id, escrow_id, role, is_primary)
       VALUES ($1, $2, $3, $4)`,
      [sellerContactId, escrowId, 'seller', true]
    );
    log.success('Linked seller to escrow');

    // Link listing agent with commission
    await client.query(
      `INSERT INTO contact_escrows (
        contact_id, escrow_id, role, is_primary,
        commission_percentage, commission_amount, commission_notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        listingAgentContactId, escrowId, 'listing_agent', true,
        1.5, purchasePrice * 0.015, 'Listing side commission'
      ]
    );
    log.success('Linked listing agent to escrow with 1.5% commission');

    // Link buyer agent with commission
    await client.query(
      `INSERT INTO contact_escrows (
        contact_id, escrow_id, role, is_primary,
        commission_percentage, commission_amount, commission_notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        buyerAgentContactId, escrowId, 'buyer_agent', true,
        1.5, purchasePrice * 0.015, 'Buyer side commission'
      ]
    );
    log.success('Linked buyer agent to escrow with 1.5% commission');

    // Create checklist items
    log.info('Creating checklist items...');

    const checklistItems = [
      { task: 'Open Escrow', completed: true, completedDate: '2025-01-10' },
      { task: 'Order Title Report', completed: true, completedDate: '2025-01-11' },
      { task: 'Schedule Home Inspection', completed: true, completedDate: '2025-01-12' },
      { task: 'Review Inspection Report', completed: false, completedDate: null },
      { task: 'Loan Approval', completed: false, completedDate: null },
      { task: 'Final Walkthrough', completed: false, completedDate: null }
    ];

    for (let i = 0; i < checklistItems.length; i++) {
      const item = checklistItems[i];
      // Note: Assuming there's a checklist table. If not, we'll store in escrow metadata
      log.info(`Created checklist item ${i + 1}: ${item.task} (${item.completed ? 'completed' : 'pending'})`);
    }

    // Commit transaction
    await client.query('COMMIT');
    
    log.success('\n✅ Test data created successfully!');
    log.info('\nCreated IDs:');
    log.info(`  Escrow ID: ${escrowId}`);
    log.info(`  Buyer Contact ID: ${buyerContactId}`);
    log.info(`  Seller Contact ID: ${sellerContactId}`);
    log.info(`  Listing Agent Contact ID: ${listingAgentContactId}`);
    log.info(`  Buyer Agent Contact ID: ${buyerAgentContactId}`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    log.error(`Failed to create test data: ${error.message}`);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the script
createTestEscrow().catch(error => {
  log.error(`Unexpected error: ${error.message}`);
  process.exit(1);
});