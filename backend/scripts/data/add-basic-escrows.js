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
    commission: 87500
  },
  {
    displayId: 'ESC-2025-004',
    address: '456 Sunset Boulevard, West Hollywood, CA 90069',
    status: 'Active',
    price: 2750000,
    acceptanceDate: '2025-01-12',
    closingDate: '2025-03-01',
    commission: 68750
  },
  {
    displayId: 'ESC-2025-005',
    address: '321 Wilshire Drive, Santa Monica, CA 90402',
    status: 'Active',
    price: 4200000,
    acceptanceDate: '2025-01-15',
    closingDate: '2025-03-15',
    commission: 105000
  },
  {
    displayId: 'ESC-2025-006',
    address: '654 Pacific Coast Highway, Malibu, CA 90265',
    status: 'Pending',
    price: 5500000,
    acceptanceDate: '2025-01-08',
    closingDate: '2025-02-20',
    commission: 137500
  },
  {
    displayId: 'ESC-2025-007',
    address: '987 Rodeo Drive, Beverly Hills, CA 90210',
    status: 'Active',
    price: 8900000,
    acceptanceDate: '2025-01-18',
    closingDate: '2025-03-30',
    commission: 222500
  },
  {
    displayId: 'ESC-2025-008',
    address: '159 Maple Street, Pasadena, CA 91101',
    status: 'Active',
    price: 1850000,
    acceptanceDate: '2025-01-20',
    closingDate: '2025-03-10',
    commission: 46250
  },
  {
    displayId: 'ESC-2025-009',
    address: '753 Ocean View Drive, Redondo Beach, CA 90277',
    status: 'Active',
    price: 2400000,
    acceptanceDate: '2025-01-22',
    closingDate: '2025-03-05',
    commission: 60000
  },
  {
    displayId: 'ESC-2025-010',
    address: '852 Hillside Avenue, Manhattan Beach, CA 90266',
    status: 'Pending',
    price: 3200000,
    acceptanceDate: '2025-01-14',
    closingDate: '2025-02-25',
    commission: 80000
  }
];

async function addEscrowsToDatabase(pool, suffix, dbName) {
  console.log(`\n📦 Adding escrows to ${dbName} database...`);
  let addedCount = 0;
  let skippedCount = 0;
  
  try {
    for (const escrow of newEscrows) {
      try {
        // Check if escrow already exists
        const checkResult = await pool.query(
          'SELECT display_id FROM escrows WHERE display_id = $1',
          [escrow.displayId]
        );
        
        if (checkResult.rows.length > 0) {
          console.log(`  ⏭️  ${escrow.displayId} already exists`);
          skippedCount++;
          continue;
        }
        
        // Insert escrow with suffix
        await pool.query(`
          INSERT INTO escrows (
            display_id, property_address, escrow_status, purchase_price,
            acceptance_date, closing_date, gross_commission, commission_percentage,
            property_type, lead_source
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
          escrow.displayId,
          escrow.address + suffix,
          escrow.status,
          escrow.price,
          escrow.acceptanceDate,
          escrow.closingDate,
          escrow.commission,
          2.5,
          'Single Family Home',
          'Referral'
        ]);
        
        console.log(`  ✅ ${escrow.displayId} - ${escrow.address}${suffix}`);
        addedCount++;
        
      } catch (err) {
        console.log(`  ❌ Failed to add ${escrow.displayId}: ${err.message}`);
      }
    }
    
    console.log(`\n📊 ${dbName} Summary: ${addedCount} added, ${skippedCount} skipped`);
    
  } catch (error) {
    console.error(`\n❌ Database error for ${dbName}:`, error.message);
  }
}

async function main() {
  try {
    console.log('🚀 Adding New Escrows to Both Databases\n');
    console.log('📝 Total escrows to add:', newEscrows.length);
    
    // Add to local database
    await addEscrowsToDatabase(localPool, ' - LOCAL', 'LOCAL');
    
    // Add to Railway production database
    await addEscrowsToDatabase(railwayPool, ' - PRODUCTION', 'PRODUCTION');
    
    console.log('\n✅ Script completed!\n');
    
  } catch (error) {
    console.error('❌ Script error:', error);
  } finally {
    await localPool.end();
    await railwayPool.end();
  }
}

main();