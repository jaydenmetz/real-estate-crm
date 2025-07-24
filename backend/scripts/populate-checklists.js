// Script to populate default checklist items for escrows
const { Pool } = require('pg');
require('dotenv').config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local'
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Default checklist templates
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

async function populateChecklists() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Get all escrows
    const escrowsResult = await client.query('SELECT id, acceptance_date, closing_date FROM escrows');
    const escrows = escrowsResult.rows;
    
    console.log(`Found ${escrows.length} escrows to update`);
    
    for (const escrow of escrows) {
      console.log(`\nProcessing escrow ${escrow.id}...`);
      
      // Check if escrow already has checklist items
      const checkResult = await client.query(
        'SELECT checklist_items FROM escrow_checklists WHERE escrow_id = $1',
        [escrow.id]
      );
      
      if (checkResult.rows.length > 0 && checkResult.rows[0].checklist_items && checkResult.rows[0].checklist_items.length > 0) {
        console.log(`  - Skipping ${escrow.id}, already has checklist items`);
        continue;
      }
      
      // Calculate due dates based on escrow dates
      const acceptanceDate = new Date(escrow.acceptance_date || new Date());
      const closingDate = new Date(escrow.closing_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
      
      const checklistWithDates = defaultChecklist.map(item => ({
        ...item,
        due_date: item.due_days >= 0 
          ? new Date(acceptanceDate.getTime() + item.due_days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          : new Date(closingDate.getTime() + item.due_days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        completed_date: null
      }));
      
      // Insert or update checklist
      if (checkResult.rows.length === 0) {
        // Insert new row
        await client.query(
          'INSERT INTO escrow_checklists (escrow_id, checklist_items) VALUES ($1, $2)',
          [escrow.id, JSON.stringify(checklistWithDates)]
        );
        console.log('  ✓ Created new checklist');
      } else {
        // Update existing row
        await client.query(
          'UPDATE escrow_checklists SET checklist_items = $2, updated_at = NOW() WHERE escrow_id = $1',
          [escrow.id, JSON.stringify(checklistWithDates)]
        );
        console.log('  ✓ Updated existing checklist');
      }
    }
    
    await client.query('COMMIT');
    console.log('\n✅ Successfully populated checklists for all escrows');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error populating checklists:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the script
populateChecklists()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));