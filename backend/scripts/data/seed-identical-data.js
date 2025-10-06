// Script to seed identical data in both local and production databases
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

// Local database connection
const localPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

// Production database connection
const productionPool = new Pool({
  connectionString: process.env.RAILWAY_DATABASE_URL || process.env.PRODUCTION_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Sample escrow data
const escrowData = [
  {
    displayId: 'ESC-2025-0001',
    address: '123 Main Street, Los Angeles, CA 90001',
    status: 'Active',
    price: 850000,
    acceptanceDate: '2025-01-15',
    closingDate: '2025-02-28'
  },
  {
    displayId: 'ESC-2025-0002',
    address: '456 Oak Avenue, Beverly Hills, CA 90210',
    status: 'Active',
    price: 2500000,
    acceptanceDate: '2025-01-10',
    closingDate: '2025-03-15'
  }
];

// Default checklist template
const defaultChecklist = [
  // Opening Phase
  { phase: 'opening', task_name: 'Open Escrow', task_description: 'Officially open escrow with title company', is_completed: false, due_days: 0, order: 1 },
  { phase: 'opening', task_name: 'Earnest Money Deposit', task_description: 'Collect and deposit earnest money', is_completed: false, due_days: 3, order: 2 },
  { phase: 'opening', task_name: 'Preliminary Title Report', task_description: 'Order and review preliminary title report', is_completed: false, due_days: 5, order: 3 },
  { phase: 'opening', task_name: 'Property Disclosures', task_description: 'Deliver all required property disclosures', is_completed: false, due_days: 7, order: 4 },
  { phase: 'opening', task_name: 'Home Inspection', task_description: 'Schedule and complete home inspection', is_completed: false, due_days: 10, order: 5 },
  
  // Processing Phase
  { phase: 'processing', task_name: 'Loan Application', task_description: 'Submit complete loan application', is_completed: false, due_days: 5, order: 6 },
  { phase: 'processing', task_name: 'Appraisal', task_description: 'Schedule and complete property appraisal', is_completed: false, due_days: 15, order: 7 },
  { phase: 'processing', task_name: 'Loan Approval', task_description: 'Obtain final loan approval', is_completed: false, due_days: 25, order: 8 },
  { phase: 'processing', task_name: 'Insurance', task_description: 'Secure homeowners insurance', is_completed: false, due_days: 20, order: 9 },
  { phase: 'processing', task_name: 'HOA Documents', task_description: 'Review HOA documents if applicable', is_completed: false, due_days: 15, order: 10 },
  
  // Closing Phase
  { phase: 'closing', task_name: 'Final Walkthrough', task_description: 'Complete final property walkthrough', is_completed: false, due_days: -2, order: 11 },
  { phase: 'closing', task_name: 'Closing Documents', task_description: 'Review and sign closing documents', is_completed: false, due_days: -1, order: 12 },
  { phase: 'closing', task_name: 'Fund Loan', task_description: 'Lender funds the loan', is_completed: false, due_days: 0, order: 13 },
  { phase: 'closing', task_name: 'Record Deed', task_description: 'Record deed with county', is_completed: false, due_days: 0, order: 14 },
  { phase: 'closing', task_name: 'Deliver Keys', task_description: 'Deliver keys to new owner', is_completed: false, due_days: 0, order: 15 }
];

async function seedDatabase(pool, environment, suffix) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log(`\n🌱 Seeding ${environment} database...`);
    
    for (const [index, escrow] of escrowData.entries()) {
      // Insert escrow with environment suffix
      const insertQuery = `
        INSERT INTO escrows (
          display_id, property_address, escrow_status, purchase_price,
          earnest_money_deposit, down_payment, loan_amount,
          commission_percentage, gross_commission, net_commission,
          acceptance_date, closing_date, property_type, lead_source,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
        RETURNING display_id
      `;
      
      const values = [
        escrow.displayId,
        escrow.address + suffix, // Add environment suffix
        escrow.status,
        escrow.price,
        escrow.price * 0.01, // 1% earnest money
        escrow.price * 0.2,  // 20% down payment
        escrow.price * 0.8,  // 80% loan
        2.5, // commission percentage
        escrow.price * 0.025, // gross commission
        escrow.price * 0.025 * 0.5, // net commission (50% split)
        escrow.acceptanceDate,
        escrow.closingDate,
        'Single Family',
        'Referral'
      ];
      
      await client.query(insertQuery, values);
      
      // Create checklist with due dates
      const acceptanceDate = new Date(escrow.acceptanceDate);
      const closingDate = new Date(escrow.closingDate);
      
      const checklistWithDates = defaultChecklist.map(item => ({
        ...item,
        due_date: item.due_days >= 0 
          ? new Date(acceptanceDate.getTime() + item.due_days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          : new Date(closingDate.getTime() + item.due_days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        completed_date: null
      }));
      
      // Insert checklist
      await client.query(
        'INSERT INTO escrow_checklists (escrow_display_id, checklist_items) VALUES ($1, $2)',
        [escrow.displayId, JSON.stringify(checklistWithDates)]
      );
      
      console.log(`  ✓ Created escrow ${escrow.displayId}`);
    }
    
    await client.query('COMMIT');
    console.log(`✅ ${environment} database seeded successfully with ${escrowData.length} escrows`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`❌ Error seeding ${environment} database:`, error.message);
    throw error;
  } finally {
    client.release();
  }
}

async function seedIdenticalData() {
  try {
    // Check if we have production database URL
    if (!process.env.RAILWAY_DATABASE_URL && !process.env.PRODUCTION_DATABASE_URL) {
      console.log('⚠️  No production database URL found. Please set RAILWAY_DATABASE_URL in .env.local');
      console.log('   You can find this in your Railway project settings');
      console.log('\n   Only seeding local database...');
      
      await seedDatabase(localPool, 'LOCAL', ' - LOCAL');
    } else {
      // Seed both databases
      await seedDatabase(localPool, 'LOCAL', ' - LOCAL');
      await seedDatabase(productionPool, 'PRODUCTION', ' - PRODUCTION');
      
      console.log('\n✅ Both databases have been seeded with identical data');
      console.log('   Local addresses end with: - LOCAL');
      console.log('   Production addresses end with: - PRODUCTION');
    }
    
  } catch (error) {
    console.error('❌ Failed to seed databases:', error);
  } finally {
    await localPool.end();
    if (process.env.RAILWAY_DATABASE_URL || process.env.PRODUCTION_DATABASE_URL) {
      await productionPool.end();
    }
  }
}

// Run the script
seedIdenticalData();