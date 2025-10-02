const { Pool } = require('pg');

// Complete location details for each property
const locationUpdates = [
  {
    display_id: 'ESC-2025-2167',
    property_address: '9602 Cecilia St, Downey, CA 90241',
    city: 'Downey',
    state: 'CA',
    zip_code: '90241',
    county: 'Los Angeles',
  },
  {
    display_id: 'ESC-2025-4069',
    property_address: '13720 Colorado Ln, Victorville, CA 92395',
    city: 'Victorville',
    state: 'CA',
    zip_code: '92395',
    county: 'San Bernardino',
  },
  {
    display_id: 'ESC-2025-2467',
    property_address: '5609 Monitor St, Bakersfield, CA 93307',
    city: 'Bakersfield',
    state: 'CA',
    zip_code: '93307',
    county: 'Kern',
  },
  {
    display_id: 'ESC-2025-8173',
    property_address: '313 Darling Point Dr, Bakersfield, CA 93307',
    city: 'Bakersfield',
    state: 'CA',
    zip_code: '93307',
    county: 'Kern',
  },
  {
    display_id: 'ESC-2025-8841',
    property_address: '9753 Sunglow St, Pico Rivera, CA 90660',
    city: 'Pico Rivera',
    state: 'CA',
    zip_code: '90660',
    county: 'Los Angeles',
  },
  {
    display_id: 'ESC-2025-2305',
    property_address: '5609 Monitor St #2, Bakersfield, CA 93307',
    city: 'Bakersfield',
    state: 'CA',
    zip_code: '93307',
    county: 'Kern',
  },
];

async function updateLocationDetails() {
  // First check which columns exist in production
  const pool = new Pool({
    connectionString: 'postgresql://postgres:ueLIWnvALZWVbRdnOmpLGsrrukeGLGQQ@ballast.proxy.rlwy.net:20017/railway',
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log('=== Checking Production Database Schema ===');
    const schemaCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'escrows' 
      AND column_name IN ('city', 'state', 'zip_code', 'county')
    `);

    const existingColumns = schemaCheck.rows.map((row) => row.column_name);
    console.log('Existing location columns:', existingColumns);

    // Add missing columns if needed
    const columnsToAdd = [
      { name: 'city', type: 'VARCHAR(100)' },
      { name: 'state', type: 'VARCHAR(2)' },
      { name: 'zip_code', type: 'VARCHAR(10)' },
      { name: 'county', type: 'VARCHAR(100)' },
    ];

    for (const column of columnsToAdd) {
      if (!existingColumns.includes(column.name)) {
        console.log(`Adding column: ${column.name}`);
        await pool.query(`ALTER TABLE escrows ADD COLUMN IF NOT EXISTS ${column.name} ${column.type}`);
      }
    }

    console.log('\n=== Updating Production Database ===');
    await pool.query('BEGIN');

    for (const update of locationUpdates) {
      const result = await pool.query(
        `UPDATE escrows 
         SET city = $1, state = $2, zip_code = $3, county = $4
         WHERE display_id = $5
         RETURNING display_id, city, state, zip_code, county`,
        [update.city, update.state, update.zip_code, update.county, update.display_id],
      );

      if (result.rowCount > 0) {
        const row = result.rows[0];
        console.log(`✅ Updated ${row.display_id}: ${row.city}, ${row.state} ${row.zip_code} (${row.county} County)`);
      }
    }

    await pool.query('COMMIT');
    console.log('\n✅ Production database updated successfully!');
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('❌ Error updating production:', error.message);
  } finally {
    await pool.end();
  }

  // Update local database
  const localPool = new Pool({
    connectionString: 'postgresql://postgres:postgres@localhost:5432/real_estate_crm',
    ssl: false,
  });

  try {
    console.log('\n=== Updating Local Database ===');

    // Check local schema
    const localSchemaCheck = await localPool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'escrows' 
      AND column_name IN ('city', 'state', 'zip_code', 'county')
    `);

    const localColumns = localSchemaCheck.rows.map((row) => row.column_name);
    console.log('Existing local columns:', localColumns);

    await localPool.query('BEGIN');

    // Local database uses different display_ids
    const localUpdates = [
      { display_id: 'ESCROW-2025-0009', ...locationUpdates[0] },
      { display_id: 'ESCROW-2025-0011', ...locationUpdates[1] },
      { display_id: 'ESCROW-2025-0013', ...locationUpdates[2] },
      { display_id: 'ESCROW-2025-0015', ...locationUpdates[3] },
      { display_id: 'ESCROW-2025-0017', ...locationUpdates[4] },
      { display_id: 'ESCROW-2025-0019', ...locationUpdates[5] },
    ];

    for (const update of localUpdates) {
      // Build dynamic query based on available columns
      const updateFields = [];
      const values = [];
      let paramIndex = 1;

      if (localColumns.includes('city')) {
        updateFields.push(`city = $${paramIndex++}`);
        values.push(update.city);
      }
      if (localColumns.includes('state')) {
        updateFields.push(`state = $${paramIndex++}`);
        values.push(update.state);
      }
      if (localColumns.includes('zip_code')) {
        updateFields.push(`zip_code = $${paramIndex++}`);
        values.push(update.zip_code);
      }
      if (localColumns.includes('county')) {
        updateFields.push(`county = $${paramIndex++}`);
        values.push(update.county);
      }

      if (updateFields.length > 0) {
        values.push(update.display_id);
        const query = `UPDATE escrows SET ${updateFields.join(', ')} WHERE display_id = $${paramIndex} RETURNING display_id`;
        const result = await localPool.query(query, values);

        if (result.rowCount > 0) {
          console.log(`✅ Updated ${result.rows[0].display_id}`);
        }
      }
    }

    await localPool.query('COMMIT');
    console.log('✅ Local database updated successfully!');
  } catch (error) {
    await localPool.query('ROLLBACK');
    console.error('❌ Error updating local:', error.message);
  } finally {
    await localPool.end();
  }
}

updateLocationDetails().catch(console.error);
