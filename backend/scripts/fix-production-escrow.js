const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

// Use Railway production database URL
const connectionString = process.env.RAILWAY_DATABASE_URL;

if (!connectionString) {
  console.error('❌ RAILWAY_DATABASE_URL not found in .env.local');
  process.exit(1);
}

const pool = new Pool({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }
});

async function fixProductionEscrow() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Fixing production escrow data...\n');
    
    // Check if escrow exists
    const escrowCheck = await client.query(
      'SELECT numeric_id, display_id, property_address FROM escrows WHERE numeric_id = 20'
    );
    
    if (escrowCheck.rows.length === 0) {
      console.log('❌ Escrow #20 not found');
      return;
    }
    
    const escrow = escrowCheck.rows[0];
    console.log('✅ Found escrow:', escrow.display_id);
    
    // Add checklist data
    console.log('\n📋 Adding checklist items...');
    const checklistData = {
      items: [
        {
          phase: "opening",
          task_name: "Open Escrow",
          task_description: "Officially open escrow with title company",
          is_completed: true,
          due_date: "2025-01-22",
          completed_date: "2025-01-22",
          order: 1
        },
        {
          phase: "opening",
          task_name: "Earnest Money Deposit",
          task_description: "Collect and deposit earnest money",
          is_completed: true,
          due_date: "2025-01-25",
          completed_date: "2025-01-24",
          order: 2
        },
        {
          phase: "opening",
          task_name: "Preliminary Title Report",
          task_description: "Order and review preliminary title report",
          is_completed: true,
          due_date: "2025-01-27",
          completed_date: "2025-01-26",
          order: 3
        },
        {
          phase: "opening",
          task_name: "Property Disclosures",
          task_description: "Deliver all required property disclosures",
          is_completed: false,
          due_date: "2025-01-29",
          order: 4
        },
        {
          phase: "opening",
          task_name: "Home Inspection",
          task_description: "Schedule and complete home inspection",
          is_completed: false,
          due_date: "2025-02-01",
          order: 5
        },
        {
          phase: "processing",
          task_name: "Loan Application",
          task_description: "Submit complete loan application",
          is_completed: false,
          due_date: "2025-01-27",
          order: 6
        },
        {
          phase: "processing",
          task_name: "Appraisal",
          task_description: "Schedule and complete property appraisal",
          is_completed: false,
          due_date: "2025-02-06",
          order: 7
        },
        {
          phase: "processing",
          task_name: "Loan Approval",
          task_description: "Obtain final loan approval",
          is_completed: false,
          due_date: "2025-02-16",
          order: 8
        },
        {
          phase: "closing",
          task_name: "Final Walkthrough",
          task_description: "Complete final property walkthrough",
          is_completed: false,
          due_date: "2025-03-13",
          order: 9
        },
        {
          phase: "closing",
          task_name: "Closing Documents",
          task_description: "Review and sign closing documents",
          is_completed: false,
          due_date: "2025-03-14",
          order: 10
        }
      ]
    };
    
    // Check if table exists and insert
    try {
      await client.query(`
        INSERT INTO escrow_checklists (escrow_display_id, checklist_items)
        VALUES ($1, $2)
        ON CONFLICT (escrow_display_id) 
        DO UPDATE SET checklist_items = EXCLUDED.checklist_items
      `, [escrow.display_id, JSON.stringify(checklistData.items)]);
      console.log('✅ Added checklist items');
    } catch (err) {
      console.log('⚠️  Checklist table might not exist:', err.message);
    }
    
    // Add timeline events
    console.log('\n📅 Adding timeline events...');
    const timelineEvents = [
      ['Escrow Opened', '2025-01-22', 'Escrow officially opened with First American Title', '{"title_company": "First American Title"}'],
      ['EMD Received', '2025-01-24', 'Earnest money deposit of $287,500 received and deposited', '{"amount": 287500}'],
      ['Offer Accepted', '2025-01-22', 'Offer accepted at $5,750,000', '{"offer_amount": 5750000}'],
      ['Inspection Scheduled', '2025-01-30', 'Home inspection scheduled with ABC Inspections', '{"inspector": "ABC Inspections"}']
    ];
    
    for (const [eventType, date, desc, metadata] of timelineEvents) {
      try {
        await client.query(`
          INSERT INTO escrow_timeline (escrow_id, event_type, event_date, description, created_by, metadata)
          VALUES ($1, $2, $3, $4, $5, $6::jsonb)
          ON CONFLICT DO NOTHING
        `, [escrow.display_id, eventType, date, desc, 'Jayden Metz', metadata]);
      } catch (err) {
        console.log(`⚠️  Timeline insert failed for ${eventType}:`, err.message);
      }
    }
    console.log('✅ Added timeline events');
    
    // Add financial data
    console.log('\n💰 Adding financial data...');
    const financials = [
      ['Purchase Price', 'purchase', 5750000.00, 'Buyer', 'Seller', 'Full purchase price'],
      ['Earnest Money Deposit', 'deposit', 287500.00, 'Buyer', 'Escrow', '5% earnest money'],
      ['Down Payment', 'payment', 1725000.00, 'Buyer', 'Escrow', '30% down payment'],
      ['Loan Amount', 'financing', 4025000.00, 'Lender', 'Escrow', '70% financing'],
      ['Buyer Agent Commission', 'commission', 71875.00, 'Escrow', 'Buyer Agent', '1.25% of purchase price'],
      ['Listing Agent Commission', 'commission', 71875.00, 'Escrow', 'Listing Agent', '1.25% of purchase price'],
      ['Title Insurance', 'insurance', 8625.00, 'Buyer', 'Title Company', 'Owner title policy'],
      ['Escrow Fee', 'fee', 5750.00, 'Buyer/Seller', 'Escrow Company', 'Split 50/50']
    ];
    
    for (const [desc, category, amount, payer, payee, notes] of financials) {
      try {
        await client.query(`
          INSERT INTO escrow_financials (escrow_id, description, category, amount, payer, payee, notes)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT DO NOTHING
        `, [escrow.display_id, desc, category, amount, payer, payee, notes]);
      } catch (err) {
        console.log(`⚠️  Financial insert failed for ${desc}:`, err.message);
      }
    }
    console.log('✅ Added financial items');
    
    // Add documents
    console.log('\n📄 Adding documents...');
    const documents = [
      ['Purchase Agreement', 'contract', 'complete', '2025-01-22 10:00:00'],
      ['Earnest Money Receipt', 'receipt', 'complete', '2025-01-24 14:30:00'],
      ['Preliminary Title Report', 'title', 'complete', '2025-01-26 09:15:00'],
      ['Property Disclosures', 'disclosure', 'pending', null],
      ['Home Inspection Report', 'inspection', 'pending', null],
      ['Loan Application', 'financing', 'pending', null],
      ['Appraisal Report', 'appraisal', 'pending', null]
    ];
    
    for (const [name, type, status, uploadedAt] of documents) {
      try {
        await client.query(`
          INSERT INTO escrow_documents (escrow_id, name, type, status, uploaded_at, created_by)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT DO NOTHING
        `, [escrow.display_id, name, type, status, uploadedAt, uploadedAt ? 'Jayden Metz' : null]);
      } catch (err) {
        console.log(`⚠️  Document insert failed for ${name}:`, err.message);
      }
    }
    console.log('✅ Added documents');
    
    // Verify the data
    console.log('\n📊 Verifying data...');
    const counts = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM escrow_timeline WHERE escrow_id = $1) as timeline_count,
        (SELECT COUNT(*) FROM escrow_financials WHERE escrow_id = $1) as financial_count,
        (SELECT COUNT(*) FROM escrow_documents WHERE escrow_id = $1) as document_count
    `, [escrow.display_id]);
    
    console.log('Data counts:', counts.rows[0]);
    
    console.log('\n✅ Production escrow data fix complete!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the fix
fixProductionEscrow();