const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const pool = new Pool({
  connectionString: process.env.RAILWAY_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function fixProductionEscrow() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Fixing production escrow data with correct schema...\n');
    
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
    
    // Delete existing data first to avoid conflicts
    console.log('\n🧹 Cleaning existing data...');
    await client.query('DELETE FROM escrow_checklists WHERE escrow_display_id = $1', [escrow.display_id]);
    await client.query('DELETE FROM escrow_timeline WHERE escrow_id = $1', [escrow.display_id]);
    await client.query('DELETE FROM escrow_financials WHERE escrow_id = $1', [escrow.display_id]);
    await client.query('DELETE FROM escrow_documents WHERE escrow_id = $1', [escrow.display_id]);
    
    // Add checklist items (individual rows, not JSONB)
    console.log('\n📋 Adding checklist items...');
    const checklistItems = [
      { phase: 'opening', task: 'Open Escrow', desc: 'Officially open escrow with title company', completed: true, due: '2025-01-22', completed_date: '2025-01-22', order: 1 },
      { phase: 'opening', task: 'Earnest Money Deposit', desc: 'Collect and deposit earnest money', completed: true, due: '2025-01-25', completed_date: '2025-01-24', order: 2 },
      { phase: 'opening', task: 'Preliminary Title Report', desc: 'Order and review preliminary title report', completed: true, due: '2025-01-27', completed_date: '2025-01-26', order: 3 },
      { phase: 'opening', task: 'Property Disclosures', desc: 'Deliver all required property disclosures', completed: false, due: '2025-01-29', completed_date: null, order: 4 },
      { phase: 'opening', task: 'Home Inspection', desc: 'Schedule and complete home inspection', completed: false, due: '2025-02-01', completed_date: null, order: 5 },
      { phase: 'processing', task: 'Loan Application', desc: 'Submit complete loan application', completed: false, due: '2025-01-27', completed_date: null, order: 6 },
      { phase: 'processing', task: 'Appraisal', desc: 'Schedule and complete property appraisal', completed: false, due: '2025-02-06', completed_date: null, order: 7 },
      { phase: 'processing', task: 'Loan Approval', desc: 'Obtain final loan approval', completed: false, due: '2025-02-16', completed_date: null, order: 8 },
      { phase: 'closing', task: 'Final Walkthrough', desc: 'Complete final property walkthrough', completed: false, due: '2025-03-13', completed_date: null, order: 9 },
      { phase: 'closing', task: 'Closing Documents', desc: 'Review and sign closing documents', completed: false, due: '2025-03-14', completed_date: null, order: 10 }
    ];
    
    for (const item of checklistItems) {
      await client.query(`
        INSERT INTO escrow_checklists (
          escrow_display_id, phase, task_name, task_description, 
          is_completed, due_date, completed_date, completed_by, task_order
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        escrow.display_id, item.phase, item.task, item.desc, 
        item.completed, item.due, item.completed_date, 
        item.completed ? 'Jayden Metz' : null, item.order
      ]);
    }
    console.log('✅ Added', checklistItems.length, 'checklist items');
    
    // Add timeline events (without created_by UUID)
    console.log('\n📅 Adding timeline events...');
    const timelineEvents = [
      { type: 'Escrow Opened', date: '2025-01-22 10:00:00', desc: 'Escrow officially opened with First American Title', meta: { title_company: 'First American Title' } },
      { type: 'EMD Received', date: '2025-01-24 14:30:00', desc: 'Earnest money deposit of $287,500 received and deposited', meta: { amount: 287500 } },
      { type: 'Offer Accepted', date: '2025-01-22 09:00:00', desc: 'Offer accepted at $5,750,000', meta: { offer_amount: 5750000 } },
      { type: 'Inspection Scheduled', date: '2025-01-30 14:00:00', desc: 'Home inspection scheduled with ABC Inspections', meta: { inspector: 'ABC Inspections' } }
    ];
    
    for (const event of timelineEvents) {
      await client.query(`
        INSERT INTO escrow_timeline (escrow_id, event_type, event_date, description, metadata)
        VALUES ($1, $2, $3, $4, $5::jsonb)
      `, [escrow.display_id, event.type, event.date, event.desc, JSON.stringify(event.meta)]);
    }
    console.log('✅ Added', timelineEvents.length, 'timeline events');
    
    // Add financial data (using correct column names)
    console.log('\n💰 Adding financial data...');
    const financials = [
      { name: 'Purchase Price', cat: 'purchase', amt: 5750000, to: 'Seller', by: 'Buyer', notes: 'Full purchase price' },
      { name: 'Earnest Money Deposit', cat: 'deposit', amt: 287500, to: 'Escrow', by: 'Buyer', notes: '5% earnest money' },
      { name: 'Down Payment', cat: 'payment', amt: 1725000, to: 'Escrow', by: 'Buyer', notes: '30% down payment' },
      { name: 'Loan Amount', cat: 'financing', amt: 4025000, to: 'Escrow', by: 'Lender', notes: '70% financing' },
      { name: 'Buyer Agent Commission', cat: 'commission', amt: 71875, to: 'Jayden Metz', by: 'Escrow', notes: '1.25% of purchase price' },
      { name: 'Listing Agent Commission', cat: 'commission', amt: 71875, to: 'Listing Agent', by: 'Escrow', notes: '1.25% of purchase price' },
      { name: 'Title Insurance', cat: 'insurance', amt: 8625, to: 'Title Company', by: 'Buyer', notes: 'Owner title policy' },
      { name: 'Escrow Fee', cat: 'fee', amt: 5750, to: 'Escrow Company', by: 'Buyer/Seller', notes: 'Split 50/50' }
    ];
    
    for (const item of financials) {
      await client.query(`
        INSERT INTO escrow_financials (
          escrow_id, item_name, category, amount, paid_to, paid_by, notes, is_paid
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [escrow.display_id, item.name, item.cat, item.amt, item.to, item.by, item.notes, false]);
    }
    console.log('✅ Added', financials.length, 'financial items');
    
    // Add documents (using correct column names)
    console.log('\n📄 Adding documents...');
    const documents = [
      { name: 'Purchase Agreement', type: 'contract', status: 'complete', date: '2025-01-22 10:00:00', by: 'Jayden Metz' },
      { name: 'Earnest Money Receipt', type: 'receipt', status: 'complete', date: '2025-01-24 14:30:00', by: 'Jayden Metz' },
      { name: 'Preliminary Title Report', type: 'title', status: 'complete', date: '2025-01-26 09:15:00', by: 'Title Company' },
      { name: 'Property Disclosures', type: 'disclosure', status: 'pending', date: null, by: null },
      { name: 'Home Inspection Report', type: 'inspection', status: 'pending', date: null, by: null },
      { name: 'Loan Application', type: 'financing', status: 'pending', date: null, by: null },
      { name: 'Appraisal Report', type: 'appraisal', status: 'pending', date: null, by: null }
    ];
    
    for (const doc of documents) {
      await client.query(`
        INSERT INTO escrow_documents (
          escrow_id, document_name, document_type, status, upload_date, uploaded_by
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `, [escrow.display_id, doc.name, doc.type, doc.status, doc.date, doc.by]);
    }
    console.log('✅ Added', documents.length, 'documents');
    
    // Verify the data
    console.log('\n📊 Verifying data...');
    const counts = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM escrow_timeline WHERE escrow_id = $1) as timeline_count,
        (SELECT COUNT(*) FROM escrow_financials WHERE escrow_id = $1) as financial_count,
        (SELECT COUNT(*) FROM escrow_documents WHERE escrow_id = $1) as document_count,
        (SELECT COUNT(*) FROM escrow_checklists WHERE escrow_display_id = $1) as checklist_count
    `, [escrow.display_id]);
    
    console.log('Data counts:', counts.rows[0]);
    
    console.log('\n✅ Production escrow data fix complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

fixProductionEscrow();