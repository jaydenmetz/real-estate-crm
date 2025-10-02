const { Pool } = require('pg');

// Correct addresses based on user information
const addressUpdates = [
  {
    display_id: 'ESC-2025-2167',
    property_address: '9602 Cecilia St, Downey, CA 90241',
  },
  {
    display_id: 'ESC-2025-4069',
    property_address: '13720 Colorado Ln, Victorville, CA 92395',
  },
  {
    display_id: 'ESC-2025-2467',
    property_address: '5609 Monitor St, Bakersfield, CA 93307',
  },
  {
    display_id: 'ESC-2025-8173',
    property_address: '313 Darling Point Dr, Bakersfield, CA 93313',
  },
  {
    display_id: 'ESC-2025-8841',
    property_address: '9753 Sunglow St, Bakersfield, CA 93313',
  },
  {
    display_id: 'ESC-2025-2305',
    property_address: '5609 Monitor St #2, Bakersfield, CA 93307',
  },
];

async function updateAddresses() {
  // Production database connection
  const pool = new Pool({
    connectionString: 'postgresql://postgres:ueLIWnvALZWVbRdnOmpLGsrrukeGLGQQ@ballast.proxy.rlwy.net:20017/railway',
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log('Connected to production database');

    // Begin transaction
    await pool.query('BEGIN');

    // Update each escrow with correct address
    for (const update of addressUpdates) {
      const result = await pool.query(
        'UPDATE escrows SET property_address = $1 WHERE display_id = $2 RETURNING display_id, property_address',
        [update.property_address, update.display_id],
      );

      if (result.rowCount > 0) {
        console.log(`✅ Updated ${update.display_id}: ${result.rows[0].property_address}`);
      } else {
        console.log(`❌ No escrow found with display_id: ${update.display_id}`);
      }
    }

    // Commit transaction
    await pool.query('COMMIT');
    console.log('\n✅ All addresses updated successfully!');
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('❌ Error updating addresses:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Also update local database
async function updateLocalAddresses() {
  const pool = new Pool({
    connectionString: 'postgresql://postgres:postgres@localhost:5432/real_estate_crm',
    ssl: false,
  });

  try {
    console.log('\nConnected to local database');

    // Begin transaction
    await pool.query('BEGIN');

    // Update addresses based on existing display IDs
    const localUpdates = [
      { display_id: 'ESCROW-2025-0009', property_address: '9602 Cecilia St, Downey, CA 90241' },
      { display_id: 'ESCROW-2025-0011', property_address: '13720 Colorado Ln, Victorville, CA 92395' },
      { display_id: 'ESCROW-2025-0013', property_address: '5609 Monitor St, Bakersfield, CA 93307' },
      { display_id: 'ESCROW-2025-0015', property_address: '313 Darling Point Dr, Bakersfield, CA 93313' },
      { display_id: 'ESCROW-2025-0017', property_address: '9753 Sunglow St, Bakersfield, CA 93313' },
      { display_id: 'ESCROW-2025-0019', property_address: '5609 Monitor St #2, Bakersfield, CA 93307' },
    ];

    for (const update of localUpdates) {
      const result = await pool.query(
        'UPDATE escrows SET property_address = $1 WHERE display_id = $2 RETURNING display_id, property_address',
        [update.property_address, update.display_id],
      );

      if (result.rowCount > 0) {
        console.log(`✅ Updated ${update.display_id}: ${result.rows[0].property_address}`);
      }
    }

    // Commit transaction
    await pool.query('COMMIT');
    console.log('✅ Local addresses updated successfully!');
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('❌ Error updating local addresses:', error);
  } finally {
    await pool.end();
  }
}

// Run both updates
async function runUpdates() {
  console.log('=== Updating Production Database ===');
  await updateAddresses();

  console.log('\n=== Updating Local Database ===');
  await updateLocalAddresses();
}

runUpdates().catch(console.error);
