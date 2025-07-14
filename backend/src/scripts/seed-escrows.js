const { Pool } = require('pg');
const redis = require('../config/redis');
const logger = require('../utils/logger');
require('dotenv').config();

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Mock data
const mockEscrows = [
  {
    id: "esc_2025_001_jm",
    externalId: "ESC-2025-001",
    teamId: "team_jm_default",
    userId: "user_jm_001",
    address: {
      street: "456 Ocean View Dr",
      city: "La Jolla",
      state: "CA",
      zipCode: "92037",
      formatted: "456 Ocean View Dr, La Jolla, CA 92037"
    },
    status: "active",
    stage: "inspection",
    propertyType: "Single Family",
    listingMls: "SD2025-123456",
    purchasePrice: 1250000,
    originalListPrice: 1200000,
    closingDate: "2025-07-29",
    estimatedClosingDate: "2025-07-29",
    actualClosingDate: null,
    acceptanceDate: "2025-06-14",
    earnestMoneyDeposit: 37500,
    downPayment: 250000,
    loanAmount: 1000000,
    escrowCompany: "Pacific Escrow",
    escrowOfficer: "Lisa Martinez",
    titleCompany: "First American Title",
    lender: "Wells Fargo",
    totalCommission: 31250,
    commissionRate: 2.5,
    transactionProgress: 33,
    notes: "Original escrow from system. Inspection contingency removal due 6/24.",
    parties: [
      { party_type: "buyer", name: "Michael Chen", email: "chen.family@email.com", phone: "+18585551234" },
      { party_type: "buyer", name: "Sarah Chen", email: "chen.family@email.com", phone: "+18585551234" },
      { party_type: "seller", name: "Robert Johnson", email: "rjohnson@email.com", phone: "+18585555678" },
      { party_type: "buyer_agent", name: "Jayden Metz", email: "jayden@jaydenmetz.com", company: "Metz Real Estate" },
      { party_type: "seller_agent", name: "Jayden Metz", email: "jayden@jaydenmetz.com", company: "Metz Real Estate" }
    ]
  },
  {
    id: "esc_2025_002_jm",
    externalId: "ESC-2025-002",
    teamId: "team_jm_default",
    userId: "user_jm_001",
    address: {
      street: "789 Sunset Cliffs Blvd",
      city: "San Diego",
      state: "CA",
      zipCode: "92107",
      formatted: "789 Sunset Cliffs Blvd, San Diego, CA 92107"
    },
    status: "active",
    stage: "loan_processing",
    propertyType: "Condo",
    listingMls: "SD2025-234567",
    purchasePrice: 850000,
    originalListPrice: 875000,
    closingDate: "2025-08-15",
    estimatedClosingDate: "2025-08-15",
    actualClosingDate: null,
    acceptanceDate: "2025-06-01",
    earnestMoneyDeposit: 25000,
    downPayment: 170000,
    loanAmount: 680000,
    escrowCompany: "Chicago Title",
    escrowOfficer: "Mark Thompson",
    titleCompany: "Chicago Title",
    lender: "Bank of America",
    totalCommission: 21250,
    commissionRate: 2.5,
    transactionProgress: 65,
    notes: "Loan in underwriting. Appraisal came in at value. HOA docs delivered.",
    parties: [
      { party_type: "buyer", name: "Jennifer Lee", email: "jlee@email.com", phone: "+18585552345" },
      { party_type: "seller", name: "David Martinez", email: "dmartinez@email.com", phone: "+18585553456" },
      { party_type: "seller", name: "Maria Martinez", email: "mmartinez@email.com", phone: "+18585553456" }
    ]
  },
  {
    id: "esc_2025_003_jm",
    externalId: "ESC-2025-003",
    teamId: "team_jm_default",
    userId: "user_jm_001",
    address: {
      street: "1234 Pacific Beach Dr",
      city: "San Diego",
      state: "CA",
      zipCode: "92109",
      formatted: "1234 Pacific Beach Dr, San Diego, CA 92109"
    },
    status: "pending",
    stage: "offer_negotiation",
    propertyType: "Townhouse",
    listingMls: "SD2025-345678",
    purchasePrice: 950000,
    originalListPrice: 999000,
    closingDate: "2025-09-01",
    estimatedClosingDate: "2025-09-01",
    actualClosingDate: null,
    acceptanceDate: null,
    earnestMoneyDeposit: 30000,
    downPayment: 95000,
    loanAmount: 855000,
    escrowCompany: null,
    escrowOfficer: null,
    titleCompany: null,
    lender: "Chase Bank",
    totalCommission: 23750,
    commissionRate: 2.5,
    transactionProgress: 10,
    notes: "Counter offer submitted. Awaiting seller response. Buyers are pre-approved.",
    parties: [
      { party_type: "buyer", name: "Thomas Wilson", email: "twilson@email.com", phone: "+18585554567" },
      { party_type: "buyer", name: "Emily Wilson", email: "ewilson@email.com", phone: "+18585554567" },
      { party_type: "seller", name: "Patricia Brown", email: "pbrown@email.com", phone: "+18585555678" }
    ]
  },
  {
    id: "esc_2024_087_jm",
    externalId: "ESC-2024-087",
    teamId: "team_jm_default",
    userId: "user_jm_001",
    address: {
      street: "567 Coronado Ave",
      city: "Coronado",
      state: "CA",
      zipCode: "92118",
      formatted: "567 Coronado Ave, Coronado, CA 92118"
    },
    status: "closed",
    stage: "completed",
    propertyType: "Single Family",
    listingMls: "SD2024-987654",
    purchasePrice: 2150000,
    originalListPrice: 2250000,
    closingDate: "2024-12-15",
    estimatedClosingDate: "2024-12-20",
    actualClosingDate: "2024-12-15",
    acceptanceDate: "2024-10-15",
    earnestMoneyDeposit: 65000,
    downPayment: 645000,
    loanAmount: 1505000,
    escrowCompany: "Stewart Title",
    escrowOfficer: "Rebecca Chen",
    titleCompany: "Stewart Title",
    lender: "Union Bank",
    totalCommission: 53750,
    commissionRate: 2.5,
    transactionProgress: 100,
    notes: "Smooth transaction. Closed 5 days early. Clients very happy.",
    parties: [
      { party_type: "buyer", name: "Richard Anderson", email: "randerson@email.com", phone: "+18585556789" },
      { party_type: "buyer", name: "Susan Anderson", email: "sanderson@email.com", phone: "+18585556789" },
      { party_type: "seller", name: "George Taylor", email: "gtaylor@email.com", phone: "+18585557890" }
    ]
  },
  {
    id: "esc_2025_004_jm",
    externalId: "ESC-2025-004",
    teamId: "team_jm_default",
    userId: "user_jm_001",
    address: {
      street: "890 Market St",
      unit: "Unit 4B",
      city: "San Diego",
      state: "CA",
      zipCode: "92101",
      formatted: "890 Market St Unit 4B, San Diego, CA 92101"
    },
    status: "active",
    stage: "opening",
    propertyType: "Condo",
    listingMls: "SD2025-456789",
    purchasePrice: 650000,
    originalListPrice: 675000,
    closingDate: "2025-08-30",
    estimatedClosingDate: "2025-08-30",
    actualClosingDate: null,
    acceptanceDate: "2025-06-12",
    earnestMoneyDeposit: 20000,
    downPayment: 130000,
    loanAmount: 520000,
    escrowCompany: "Ticor Title",
    escrowOfficer: "James Park",
    titleCompany: "Ticor Title",
    lender: "Quicken Loans",
    totalCommission: 16250,
    commissionRate: 2.5,
    transactionProgress: 15,
    notes: "First time buyers. FHA loan. Scheduling inspections.",
    parties: [
      { party_type: "buyer", name: "Kevin Chang", email: "kchang@email.com", phone: "+18585558901" },
      { party_type: "seller", name: "Linda White", email: "lwhite@email.com", phone: "+18585559012" }
    ]
  }
];

async function seedDatabase() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // 1. Create default team if not exists
    await client.query(`
      INSERT INTO teams (team_id, name, subdomain, settings)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (team_id) DO NOTHING
    `, ['team_jm_default', 'Jayden Metz Real Estate', 'jaydenmetz', JSON.stringify({
      timezone: 'America/Los_Angeles',
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY'
    })]);
    
    // 2. Create default user if not exists
    await client.query(`
      INSERT INTO users (id, email, first_name, last_name, role, team_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id) DO NOTHING
    `, ['user_jm_001', 'jayden@jaydenmetz.com', 'Jayden', 'Metz', 'admin', 'team_jm_default']);
    
    // 3. Clear existing escrows (except the original one)
    await client.query(`
      UPDATE escrows 
      SET deleted_at = CURRENT_TIMESTAMP 
      WHERE external_id != 'ESC-2025-001' 
      AND deleted_at IS NULL
      AND team_id = 'team_jm_default'
    `);
    
    // 4. Insert mock escrows
    for (const escrow of mockEscrows) {
      // Check if escrow already exists
      const existing = await client.query(
        'SELECT id FROM escrows WHERE internal_id = $1',
        [escrow.id]
      );
      
      if (existing.rows.length > 0) {
        logger.info(`Escrow ${escrow.id} already exists, skipping...`);
        continue;
      }
      
      // Insert escrow
      const escrowResult = await client.query(`
        INSERT INTO escrows (
          internal_id, external_id, team_id, user_id,
          address, status, stage, property_type, listing_mls,
          purchase_price, original_list_price, total_commission, commission_rate,
          closing_date, estimated_closing_date, actual_closing_date, acceptance_date,
          earnest_money_deposit, down_payment, loan_amount,
          escrow_company, escrow_officer, title_company, lender,
          transaction_progress, notes
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
          $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26
        ) RETURNING id
      `, [
        escrow.id,
        escrow.externalId,
        escrow.teamId,
        escrow.userId,
        JSON.stringify(escrow.address),
        escrow.status,
        escrow.stage,
        escrow.propertyType,
        escrow.listingMls,
        escrow.purchasePrice,
        escrow.originalListPrice,
        escrow.totalCommission,
        escrow.commissionRate,
        escrow.closingDate,
        escrow.estimatedClosingDate,
        escrow.actualClosingDate,
        escrow.acceptanceDate,
        escrow.earnestMoneyDeposit,
        escrow.downPayment,
        escrow.loanAmount,
        escrow.escrowCompany,
        escrow.escrowOfficer,
        escrow.titleCompany,
        escrow.lender,
        escrow.transactionProgress,
        escrow.notes
      ]);
      
      const escrowId = escrowResult.rows[0].id;
      
      // Insert parties
      for (const party of escrow.parties) {
        await client.query(`
          INSERT INTO escrow_parties (
            escrow_id, party_type, name, email, phone, company, license_number
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          escrowId,
          party.party_type,
          party.name,
          party.email,
          party.phone,
          party.company || null,
          party.license_number || null
        ]);
      }
      
      // Create timeline events
      await createTimelineEvents(client, escrowId, escrow);
      
      // Create checklist items
      await createChecklistItems(client, escrowId, escrow);
      
      logger.info(`Created escrow ${escrow.externalId}`);
    }
    
    await client.query('COMMIT');
    
    // Clear Redis cache
    const cacheKeys = await redis.keys('escrow:*');
    if (cacheKeys.length > 0) {
      await redis.del(...cacheKeys);
    }
    
    logger.info('✅ Database seeded successfully!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function createTimelineEvents(client, escrowId, escrow) {
  const events = [];
  
  // Always add escrow opened event
  if (escrow.acceptanceDate) {
    events.push({
      event_type: 'offer_accepted',
      event_date: escrow.acceptanceDate,
      description: 'Offer accepted by seller',
      status: 'completed'
    });
  }
  
  // Add stage-specific events
  if (['opening', 'inspection', 'loan_processing', 'closing', 'completed'].includes(escrow.stage)) {
    events.push({
      event_type: 'escrow_opened',
      event_date: new Date(new Date(escrow.acceptanceDate).getTime() + 86400000).toISOString().split('T')[0],
      description: 'Escrow opened',
      status: 'completed'
    });
  }
  
  if (['inspection', 'loan_processing', 'closing', 'completed'].includes(escrow.stage)) {
    events.push({
      event_type: 'earnest_money_deposited',
      event_date: new Date(new Date(escrow.acceptanceDate).getTime() + 3 * 86400000).toISOString().split('T')[0],
      description: 'Earnest money deposited',
      status: 'completed'
    });
  }
  
  if (['loan_processing', 'closing', 'completed'].includes(escrow.stage)) {
    events.push({
      event_type: 'inspection_completed',
      event_date: new Date(new Date(escrow.acceptanceDate).getTime() + 10 * 86400000).toISOString().split('T')[0],
      description: 'Property inspection completed',
      status: 'completed'
    });
  }
  
  if (escrow.stage === 'completed') {
    events.push({
      event_type: 'closing_completed',
      event_date: escrow.actualClosingDate,
      description: 'Transaction closed successfully',
      status: 'completed'
    });
  }
  
  // Add future events
  if (escrow.status === 'active' && escrow.closingDate) {
    events.push({
      event_type: 'scheduled_closing',
      event_date: escrow.closingDate,
      description: 'Scheduled closing date',
      status: 'pending'
    });
  }
  
  // Insert all events
  for (const event of events) {
    await client.query(`
      INSERT INTO escrow_timeline (
        escrow_id, event_type, event_date, description, status
      ) VALUES ($1, $2, $3, $4, $5)
    `, [escrowId, event.event_type, event.event_date, event.description, event.status]);
  }
}

async function createChecklistItems(client, escrowId, escrow) {
  const checklist = [
    { key: 'contract_executed', label: 'Fully Executed Contract', completed: escrow.acceptanceDate ? true : false },
    { key: 'earnest_money', label: 'Earnest Money Deposited', completed: ['inspection', 'loan_processing', 'closing', 'completed'].includes(escrow.stage) },
    { key: 'disclosures', label: 'Seller Disclosures Delivered', completed: ['inspection', 'loan_processing', 'closing', 'completed'].includes(escrow.stage) },
    { key: 'inspection_ordered', label: 'Inspection Ordered', completed: ['inspection', 'loan_processing', 'closing', 'completed'].includes(escrow.stage) },
    { key: 'inspection_completed', label: 'Inspection Completed', completed: ['loan_processing', 'closing', 'completed'].includes(escrow.stage) },
    { key: 'loan_application', label: 'Loan Application Submitted', completed: ['loan_processing', 'closing', 'completed'].includes(escrow.stage) },
    { key: 'appraisal_ordered', label: 'Appraisal Ordered', completed: ['loan_processing', 'closing', 'completed'].includes(escrow.stage) },
    { key: 'title_ordered', label: 'Title Report Ordered', completed: ['loan_processing', 'closing', 'completed'].includes(escrow.stage) },
    { key: 'loan_approved', label: 'Loan Approved', completed: ['closing', 'completed'].includes(escrow.stage) },
    { key: 'closing_scheduled', label: 'Closing Scheduled', completed: ['closing', 'completed'].includes(escrow.stage) },
    { key: 'final_walkthrough', label: 'Final Walk-through', completed: escrow.stage === 'completed' },
    { key: 'closing_complete', label: 'Closing Complete', completed: escrow.stage === 'completed' }
  ];
  
  let order = 0;
  for (const item of checklist) {
    await client.query(`
      INSERT INTO escrow_checklist (
        escrow_id, item_key, item_label, category, is_completed, 
        completed_at, display_order
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      escrowId,
      item.key,
      item.label,
      'standard',
      item.completed,
      item.completed ? new Date() : null,
      order++
    ]);
  }
}

// Run the seeder
if (require.main === module) {
  seedDatabase()
    .then(() => {
      logger.info('Seeding completed');
      process.exit(0);
    })
    .catch(err => {
      logger.error('Seeding failed:', err);
      process.exit(1);
    });
}

module.exports = { seedDatabase };