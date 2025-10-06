const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  connectionString: 'postgresql://postgres:postgres@localhost:5432/realestate_crm',
  ssl: false
});

// Tables to query (in order considering foreign key dependencies)
const tables = [
  'migrations',
  'teams',
  'users',
  'escrows',
  'escrow_buyers',
  'escrow_sellers',
  'listings',
  'listing_price_history',
  'listing_showings',
  'listing_marketing_checklist',
  'listing_analytics',
  'clients',
  'leads',
  'appointments',
  'documents',
  'notes',
  'ai_agents'
];

async function listAllData() {
  try {
    console.log('='.repeat(80));
    console.log('REAL ESTATE CRM DATABASE - ALL DATA');
    console.log('='.repeat(80));
    console.log('');

    for (const table of tables) {
      console.log(`\n${'-'.repeat(60)}`);
      console.log(`TABLE: ${table.toUpperCase()}`);
      console.log(`${'-'.repeat(60)}`);

      try {
        // Get count
        const countResult = await pool.query(`SELECT COUNT(*) FROM ${table}`);
        const count = countResult.rows[0].count;
        console.log(`Total Records: ${count}`);

        if (count > 0) {
          // Get all data
          let orderBy = 'created_at DESC';
          if (table === 'migrations') {
            orderBy = 'executed_at DESC';
          }
          const result = await pool.query(`SELECT * FROM ${table} ORDER BY ${orderBy} LIMIT 100`);
          
          if (result.rows.length > 0) {
            console.log('\nRecords:');
            result.rows.forEach((row, index) => {
              console.log(`\n[${index + 1}]`);
              Object.entries(row).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                  if (typeof value === 'object') {
                    console.log(`  ${key}: ${JSON.stringify(value)}`);
                  } else {
                    console.log(`  ${key}: ${value}`);
                  }
                }
              });
            });

            if (count > 100) {
              console.log(`\n... and ${count - 100} more records`);
            }
          }
        } else {
          console.log('No data in this table');
        }
      } catch (error) {
        console.log(`Error querying ${table}: ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('END OF DATA DUMP');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('Error connecting to database:', error);
  } finally {
    await pool.end();
  }
}

// Run the script
listAllData();