require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function populateEscrowHelpers() {
  try {
    // Get first escrow to populate with sample data
    const escrowResult = await pool.query(`
      SELECT display_id, acceptance_date, closing_date, purchase_price 
      FROM escrows 
      WHERE display_id = 'ESC-2025-0001'
    `);
    
    if (escrowResult.rows.length === 0) {
      console.log('No escrow found with ID ESC-2025-0001');
      return;
    }
    
    const escrow = escrowResult.rows[0];
    const acceptanceDate = new Date(escrow.acceptance_date);
    const closingDate = new Date(escrow.closing_date);
    const purchasePrice = parseFloat(escrow.purchase_price);
    
    // Clear existing data for this escrow
    await pool.query('DELETE FROM escrow_timeline WHERE escrow_display_id = $1', [escrow.display_id]);
    await pool.query('DELETE FROM escrow_financials WHERE escrow_display_id = $1', [escrow.display_id]);
    await pool.query('DELETE FROM escrow_documents WHERE escrow_display_id = $1', [escrow.display_id]);
    
    // Add timeline events
    console.log('Adding timeline events...');
    const timelineEvents = [
      // Opening Phase
      { name: 'Offer Accepted', type: 'milestone', date: acceptanceDate, completed: true, critical: true, responsible: 'Listing Agent', description: 'Purchase offer accepted by seller' },
      { name: 'Open Escrow', type: 'milestone', date: addDays(acceptanceDate, 1), completed: true, critical: true, responsible: 'Escrow Officer', description: 'Escrow account opened' },
      { name: 'Initial Deposit', type: 'deadline', date: addDays(acceptanceDate, 3), completed: true, critical: true, responsible: 'Buyer', description: 'Earnest money deposit due' },
      { name: 'Deliver Disclosures', type: 'task', date: addDays(acceptanceDate, 5), completed: true, critical: false, responsible: 'Seller', description: 'All seller disclosures delivered to buyer' },
      { name: 'Review Disclosures', type: 'deadline', date: addDays(acceptanceDate, 7), completed: false, critical: false, responsible: 'Buyer', description: 'Buyer review period ends' },
      
      // Inspection Phase
      { name: 'Home Inspection', type: 'inspection', date: addDays(acceptanceDate, 10), completed: false, critical: true, responsible: 'Buyer', description: 'General home inspection' },
      { name: 'Termite Inspection', type: 'inspection', date: addDays(acceptanceDate, 12), completed: false, critical: false, responsible: 'Buyer', description: 'Wood destroying pest inspection' },
      { name: 'Request for Repairs', type: 'deadline', date: addDays(acceptanceDate, 15), completed: false, critical: false, responsible: 'Buyer', description: 'Submit repair requests to seller' },
      { name: 'Repair Negotiations', type: 'meeting', date: addDays(acceptanceDate, 17), completed: false, critical: false, responsible: 'Both Agents', description: 'Negotiate repair credits/work' },
      
      // Financing Phase
      { name: 'Loan Application', type: 'task', date: addDays(acceptanceDate, 5), completed: true, critical: true, responsible: 'Buyer', description: 'Submit complete loan application' },
      { name: 'Appraisal Ordered', type: 'task', date: addDays(acceptanceDate, 7), completed: false, critical: true, responsible: 'Lender', description: 'Property appraisal ordered' },
      { name: 'Appraisal Completed', type: 'milestone', date: addDays(acceptanceDate, 14), completed: false, critical: true, responsible: 'Appraiser', description: 'Property appraisal report received' },
      { name: 'Loan Conditions', type: 'task', date: addDays(acceptanceDate, 21), completed: false, critical: true, responsible: 'Buyer', description: 'Submit all loan conditions' },
      { name: 'Loan Approval', type: 'milestone', date: addDays(closingDate, -7), completed: false, critical: true, responsible: 'Lender', description: 'Final loan approval' },
      
      // Closing Phase
      { name: 'Title Search', type: 'task', date: addDays(acceptanceDate, 10), completed: false, critical: true, responsible: 'Title Company', description: 'Complete title search and exam' },
      { name: 'Clear Title', type: 'milestone', date: addDays(closingDate, -10), completed: false, critical: true, responsible: 'Title Company', description: 'Title cleared for transfer' },
      { name: 'Final Walkthrough', type: 'inspection', date: addDays(closingDate, -2), completed: false, critical: true, responsible: 'Buyer', description: 'Final property inspection' },
      { name: 'Closing Documents', type: 'deadline', date: addDays(closingDate, -1), completed: false, critical: true, responsible: 'Escrow Officer', description: 'All documents ready for signing' },
      { name: 'Signing Appointment', type: 'meeting', date: closingDate, completed: false, critical: true, responsible: 'All Parties', description: 'Document signing appointment' },
      { name: 'Fund & Record', type: 'milestone', date: closingDate, completed: false, critical: true, responsible: 'Escrow Officer', description: 'Fund escrow and record deed' },
      { name: 'Keys Delivered', type: 'milestone', date: closingDate, completed: false, critical: true, responsible: 'Listing Agent', description: 'Keys delivered to buyer' }
    ];
    
    for (let i = 0; i < timelineEvents.length; i++) {
      const event = timelineEvents[i];
      await pool.query(`
        INSERT INTO escrow_timeline (
          escrow_display_id, event_name, event_type, scheduled_date, 
          completed_date, is_completed, is_critical, responsible_party, 
          event_description, order_index
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        escrow.display_id,
        event.name,
        event.type,
        event.date,
        event.completed ? event.date : null,
        event.completed,
        event.critical,
        event.responsible,
        event.description,
        i + 1
      ]);
    }
    console.log('✅ Added', timelineEvents.length, 'timeline events');
    
    // Add financial items
    console.log('Adding financial items...');
    const earnestMoney = purchasePrice * 0.01; // 1%
    const downPayment = purchasePrice * 0.20; // 20%
    const loanAmount = purchasePrice - downPayment;
    const listingCommission = purchasePrice * 0.025; // 2.5%
    const buyerCommission = purchasePrice * 0.025; // 2.5%
    
    const financialItems = [
      // Income/Credits
      { name: 'Purchase Price', category: 'income', amount: purchasePrice, responsible: 'buyer', receiving: 'seller', basis: 'Contract purchase price', estimate: false },
      { name: 'Earnest Money Deposit', category: 'credit', amount: earnestMoney, responsible: 'buyer', receiving: 'escrow', basis: '1% of purchase price', estimate: false },
      { name: 'Down Payment', category: 'credit', amount: downPayment - earnestMoney, responsible: 'buyer', receiving: 'escrow', basis: '20% of purchase price minus EMD', estimate: false },
      { name: 'Loan Proceeds', category: 'credit', amount: loanAmount, responsible: 'lender', receiving: 'escrow', basis: '80% of purchase price', estimate: false },
      
      // Seller Credits/Costs
      { name: 'Listing Agent Commission', category: 'expense', amount: -listingCommission, responsible: 'seller', receiving: 'listing_broker', basis: '2.5% of purchase price', estimate: false },
      { name: 'Buyer Agent Commission', category: 'expense', amount: -buyerCommission, responsible: 'seller', receiving: 'buyer_broker', basis: '2.5% of purchase price', estimate: false },
      { name: 'Escrow Fee (Seller)', category: 'fee', amount: -850, responsible: 'seller', receiving: 'escrow_company', basis: '50% of total escrow fee', estimate: true },
      { name: 'Title Insurance (Owner)', category: 'fee', amount: -1200, responsible: 'seller', receiving: 'title_company', basis: 'Owner title policy', estimate: true },
      { name: 'County Transfer Tax', category: 'fee', amount: -(purchasePrice * 0.0011), responsible: 'seller', receiving: 'county', basis: '$1.10 per $1000', estimate: false },
      { name: 'HOA Transfer Fee', category: 'fee', amount: -500, responsible: 'seller', receiving: 'hoa', basis: 'HOA transfer fee', estimate: true },
      { name: 'Termite Clearance', category: 'expense', amount: -800, responsible: 'seller', receiving: 'pest_company', basis: 'Section 1 termite work', estimate: true },
      
      // Buyer Costs
      { name: 'Escrow Fee (Buyer)', category: 'fee', amount: -850, responsible: 'buyer', receiving: 'escrow_company', basis: '50% of total escrow fee', estimate: true },
      { name: 'Title Insurance (Lender)', category: 'fee', amount: -800, responsible: 'buyer', receiving: 'title_company', basis: 'Lender title policy', estimate: true },
      { name: 'Loan Origination Fee', category: 'fee', amount: -(loanAmount * 0.01), responsible: 'buyer', receiving: 'lender', basis: '1% of loan amount', estimate: true },
      { name: 'Appraisal Fee', category: 'fee', amount: -650, responsible: 'buyer', receiving: 'appraiser', basis: 'Property appraisal', estimate: false },
      { name: 'Home Inspection', category: 'expense', amount: -500, responsible: 'buyer', receiving: 'inspector', basis: 'General home inspection', estimate: false },
      { name: 'Homeowners Insurance', category: 'expense', amount: -1800, responsible: 'buyer', receiving: 'insurance_company', basis: 'First year premium', estimate: true },
      { name: 'Property Tax (6 months)', category: 'expense', amount: -(purchasePrice * 0.0125 / 2), responsible: 'buyer', receiving: 'county', basis: '6 months property tax', estimate: true },
      
      // Net Calculations
      { name: 'Seller Net Proceeds', category: 'income', amount: purchasePrice - listingCommission - buyerCommission - 850 - 1200 - (purchasePrice * 0.0011) - 500 - 800, responsible: 'seller', receiving: 'seller', basis: 'Purchase price minus all seller costs', estimate: true },
      { name: 'Buyer Total Cash Needed', category: 'expense', amount: -(downPayment + 850 + 800 + (loanAmount * 0.01) + 650 + 500 + 1800 + (purchasePrice * 0.0125 / 2)), responsible: 'buyer', receiving: 'various', basis: 'Down payment plus all buyer costs', estimate: true }
    ];
    
    for (let i = 0; i < financialItems.length; i++) {
      const item = financialItems[i];
      await pool.query(`
        INSERT INTO escrow_financials (
          escrow_display_id, item_name, item_category, amount,
          party_responsible, party_receiving, calculation_basis,
          is_estimate, order_index
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        escrow.display_id,
        item.name,
        item.category,
        item.amount,
        item.responsible,
        item.receiving,
        item.basis,
        item.estimate,
        i + 1
      ]);
    }
    console.log('✅ Added', financialItems.length, 'financial items');
    
    // Add documents checklist
    console.log('Adding documents checklist...');
    const documents = [
      // Contract Documents
      { name: 'Purchase Agreement', type: 'contract', status: 'completed', required: true, dueDate: acceptanceDate },
      { name: 'Counter Offers', type: 'contract', status: 'completed', required: false, dueDate: acceptanceDate },
      { name: 'Addendums', type: 'contract', status: 'completed', required: false, dueDate: acceptanceDate },
      
      // Disclosures
      { name: 'Seller Property Questionnaire', type: 'disclosure', status: 'completed', required: true, dueDate: addDays(acceptanceDate, 5) },
      { name: 'Transfer Disclosure Statement', type: 'disclosure', status: 'completed', required: true, dueDate: addDays(acceptanceDate, 5) },
      { name: 'Natural Hazard Disclosure', type: 'disclosure', status: 'pending', required: true, dueDate: addDays(acceptanceDate, 5) },
      { name: 'Lead-Based Paint Disclosure', type: 'disclosure', status: 'pending', required: true, dueDate: addDays(acceptanceDate, 5) },
      { name: 'Supplemental Disclosures', type: 'disclosure', status: 'pending', required: false, dueDate: addDays(acceptanceDate, 5) },
      
      // Inspection Reports
      { name: 'General Home Inspection', type: 'inspection', status: 'pending', required: false, dueDate: addDays(acceptanceDate, 12) },
      { name: 'Termite Inspection Report', type: 'inspection', status: 'pending', required: true, dueDate: addDays(acceptanceDate, 14) },
      { name: 'Roof Inspection', type: 'inspection', status: 'pending', required: false, dueDate: addDays(acceptanceDate, 14) },
      { name: 'Request for Repairs', type: 'inspection', status: 'pending', required: false, dueDate: addDays(acceptanceDate, 17) },
      
      // Financial Documents
      { name: 'Loan Pre-Approval Letter', type: 'financial', status: 'completed', required: true, dueDate: acceptanceDate },
      { name: 'Proof of Funds', type: 'financial', status: 'completed', required: true, dueDate: acceptanceDate },
      { name: 'Appraisal Report', type: 'financial', status: 'pending', required: true, dueDate: addDays(acceptanceDate, 21) },
      { name: 'Loan Approval Letter', type: 'financial', status: 'pending', required: true, dueDate: addDays(closingDate, -7) },
      
      // Title Documents
      { name: 'Preliminary Title Report', type: 'legal', status: 'pending', required: true, dueDate: addDays(acceptanceDate, 10) },
      { name: 'CC&Rs / HOA Documents', type: 'legal', status: 'pending', required: false, dueDate: addDays(acceptanceDate, 7) },
      { name: 'Title Insurance Policy', type: 'legal', status: 'pending', required: true, dueDate: closingDate },
      
      // Closing Documents
      { name: 'HUD-1 / Closing Statement', type: 'financial', status: 'pending', required: true, dueDate: addDays(closingDate, -1) },
      { name: 'Grant Deed', type: 'legal', status: 'pending', required: true, dueDate: closingDate },
      { name: 'Trust Deed', type: 'legal', status: 'pending', required: true, dueDate: closingDate },
      { name: 'Closing Instructions', type: 'legal', status: 'pending', required: true, dueDate: addDays(closingDate, -3) }
    ];
    
    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i];
      await pool.query(`
        INSERT INTO escrow_documents (
          escrow_display_id, document_name, document_type, document_status,
          is_required, due_date, order_index
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        escrow.display_id,
        doc.name,
        doc.type,
        doc.status,
        doc.required,
        doc.dueDate,
        i + 1
      ]);
    }
    console.log('✅ Added', documents.length, 'documents');
    
    console.log('\n✅ Successfully populated all helper tables for escrow', escrow.display_id);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

populateEscrowHelpers();