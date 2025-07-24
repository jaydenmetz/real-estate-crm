require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const railwayPool = new Pool({
  connectionString: process.env.RAILWAY_DATABASE_URL
});

// New escrows to add
const newEscrows = [
  { id: 'ESC-2025-003', address: '789 Oak Avenue, Beverly Hills, CA 90210', status: 'Active', price: 3500000 },
  { id: 'ESC-2025-004', address: '456 Sunset Boulevard, West Hollywood, CA 90069', status: 'Active', price: 2750000 },
  { id: 'ESC-2025-005', address: '321 Wilshire Drive, Santa Monica, CA 90402', status: 'Active', price: 4200000 },
  { id: 'ESC-2025-006', address: '654 Pacific Coast Highway, Malibu, CA 90265', status: 'Pending', price: 5500000 },
  { id: 'ESC-2025-007', address: '987 Rodeo Drive, Beverly Hills, CA 90210', status: 'Active', price: 8900000 },
  { id: 'ESC-2025-008', address: '159 Maple Street, Pasadena, CA 91101', status: 'Active', price: 1850000 },
  { id: 'ESC-2025-009', address: '753 Ocean View Drive, Redondo Beach, CA 90277', status: 'Active', price: 2400000 },
  { id: 'ESC-2025-010', address: '852 Hillside Avenue, Manhattan Beach, CA 90266', status: 'Pending', price: 3200000 }
];

async function main() {
  console.log('🚀 Adding escrows to PRODUCTION database with ID field...\n');
  
  try {
    for (const escrow of newEscrows) {
      try {
        // Try with id field (production might use id instead of display_id)
        await railwayPool.query(`
          INSERT INTO escrows (
            id, property_address, escrow_status, purchase_price
          ) VALUES ($1, $2, $3, $4)
        `, [
          escrow.id,
          escrow.address + ' - PRODUCTION',
          escrow.status,
          escrow.price
        ]);
        
        console.log(`✅ Added ${escrow.id} - ${escrow.address}`);
        
      } catch (err) {
        console.log(`❌ Failed ${escrow.id}: ${err.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await railwayPool.end();
  }
}

main();