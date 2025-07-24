require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

// Create connection pools for both databases
const localPool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const railwayPool = new Pool({
  connectionString: process.env.RAILWAY_DATABASE_URL
});

// New escrows to add
const newEscrows = [
  {
    displayId: 'ESC-2025-003',
    address: '789 Oak Avenue, Beverly Hills, CA 90210',
    status: 'Active',
    price: 3500000,
    acceptanceDate: '2025-01-10',
    closingDate: '2025-02-28',
    commission: 87500,
    buyerName: 'Michael Chen',
    sellerName: 'Patricia Williams'
  },
  {
    displayId: 'ESC-2025-004',
    address: '456 Sunset Boulevard, West Hollywood, CA 90069',
    status: 'Active',
    price: 2750000,
    acceptanceDate: '2025-01-12',
    closingDate: '2025-03-01',
    commission: 68750,
    buyerName: 'David Johnson',
    sellerName: 'Karen Anderson'
  },
  {
    displayId: 'ESC-2025-005',
    address: '321 Wilshire Drive, Santa Monica, CA 90402',
    status: 'Active',
    price: 4200000,
    acceptanceDate: '2025-01-15',
    closingDate: '2025-03-15',
    commission: 105000,
    buyerName: 'Robert Lee',
    sellerName: 'Jennifer Martinez'
  },
  {
    displayId: 'ESC-2025-006',
    address: '654 Pacific Coast Highway, Malibu, CA 90265',
    status: 'Pending',
    price: 5500000,
    acceptanceDate: '2025-01-08',
    closingDate: '2025-02-20',
    commission: 137500,
    buyerName: 'Thomas Wilson',
    sellerName: 'Elizabeth Brown'
  },
  {
    displayId: 'ESC-2025-007',
    address: '987 Rodeo Drive, Beverly Hills, CA 90210',
    status: 'Active',
    price: 8900000,
    acceptanceDate: '2025-01-18',
    closingDate: '2025-03-30',
    commission: 222500,
    buyerName: 'Christopher Taylor',
    sellerName: 'Amanda Davis'
  }
];

// Helper function to create default checklist
function createDefaultChecklist() {
  return [
    // Opening Phase
    { phase: 'opening', name: 'Open Escrow', description: 'Escrow account opened', is_completed: true, order_index: 1 },
    { phase: 'opening', name: 'Initial Deposit Received', description: 'EMD received and deposited', is_completed: true, order_index: 2 },
    { phase: 'opening', name: 'Purchase Agreement Signed', description: 'All parties have signed', is_completed: true, order_index: 3 },
    { phase: 'opening', name: 'Disclosures Delivered', description: 'All required disclosures sent', is_completed: false, order_index: 4 },
    
    // Processing Phase
    { phase: 'processing', name: 'Home Inspection', description: 'Property inspection completed', is_completed: false, order_index: 5 },
    { phase: 'processing', name: 'Appraisal Ordered', description: 'Appraisal scheduled', is_completed: false, order_index: 6 },
    { phase: 'processing', name: 'Loan Application', description: 'Buyer loan application submitted', is_completed: false, order_index: 7 },
    { phase: 'processing', name: 'Title Search', description: 'Title company search initiated', is_completed: false, order_index: 8 },
    { phase: 'processing', name: 'Insurance', description: 'Homeowners insurance obtained', is_completed: false, order_index: 9 },
    
    // Closing Phase
    { phase: 'closing', name: 'Loan Approval', description: 'Final loan approval received', is_completed: false, order_index: 10 },
    { phase: 'closing', name: 'Final Walkthrough', description: 'Buyer final walkthrough complete', is_completed: false, order_index: 11 },
    { phase: 'closing', name: 'Closing Documents', description: 'All closing docs signed', is_completed: false, order_index: 12 },
    { phase: 'closing', name: 'Funds Wired', description: 'All funds received', is_completed: false, order_index: 13 },
    { phase: 'closing', name: 'Keys Delivered', description: 'Keys handed to buyer', is_completed: false, order_index: 14 }
  ];
}

async function addEscrowsToDatabase(pool, suffix) {
  console.log(`\nAdding escrows to ${suffix === ' - LOCAL' ? 'LOCAL' : 'PRODUCTION'} database...`);
  
  try {
    for (const escrow of newEscrows) {
      // Check if escrow already exists
      const checkResult = await pool.query(
        'SELECT display_id FROM escrows WHERE display_id = $1',
        [escrow.displayId]
      );
      
      if (checkResult.rows.length > 0) {
        console.log(`Escrow ${escrow.displayId} already exists, skipping...`);
        continue;
      }
      
      // Insert escrow with suffix - using simple insert without extra fields
      const escrowResult = await pool.query(`
        INSERT INTO escrows (
          display_id, property_address, escrow_status, purchase_price,
          acceptance_date, closing_date, gross_commission, commission_percentage,
          property_type, lead_source, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
        RETURNING display_id
      `, [
        escrow.displayId,
        escrow.address + suffix,
        escrow.status,
        escrow.price,
        escrow.acceptanceDate,
        escrow.closingDate,
        escrow.commission,
        2.5, // commission percentage
        'Single Family Home',
        'Referral'
      ]);
      
      console.log(`✅ Added escrow ${escrow.displayId} - ${escrow.address}${suffix}`);
      
      // Add checklist
      const checklist = createDefaultChecklist();
      await pool.query(`
        INSERT INTO escrow_checklists (escrow_display_id, checklist_items, created_at, updated_at)
        VALUES ($1, $2, NOW(), NOW())
        ON CONFLICT (escrow_display_id) DO UPDATE SET checklist_items = $2
      `, [escrow.displayId, JSON.stringify(checklist)]);
      
      console.log(`  ✅ Added checklist with ${checklist.length} items`);
      
      // Note: We're skipping buyer/seller creation since the clients table structure
      // is complex and requires first_name/last_name separation
      console.log(`  ℹ️  Buyer: ${escrow.buyerName}, Seller: ${escrow.sellerName} (not linked)`);
    }
    
    console.log(`\n✅ Successfully added escrows to ${suffix === ' - LOCAL' ? 'LOCAL' : 'PRODUCTION'} database!`);
    
  } catch (error) {
    console.error(`❌ Error adding escrows to ${suffix === ' - LOCAL' ? 'LOCAL' : 'PRODUCTION'} database:`, error.message);
  }
}

async function main() {
  try {
    console.log('🚀 Starting to add new escrows to both databases...\n');
    
    // Add to local database
    await addEscrowsToDatabase(localPool, ' - LOCAL');
    
    // Add to Railway production database
    await addEscrowsToDatabase(railwayPool, ' - PRODUCTION');
    
    console.log('\n✅ All done!');
    
  } catch (error) {
    console.error('❌ Script error:', error);
  } finally {
    await localPool.end();
    await railwayPool.end();
  }
}

main();