// Simplified script to seed identical data in both databases
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

// Local database connection
const localPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

// Production database connection  
const productionPool = new Pool({
  connectionString: process.env.RAILWAY_DATABASE_URL || process.env.PRODUCTION_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Sample escrow data
const escrowData = [
  {
    displayId: 'ESC-2025-0001',
    address: '123 Main Street, Los Angeles, CA 90001',
    status: 'Active',
    price: 850000,
    acceptanceDate: '2025-01-15',
    closingDate: '2025-02-28'
  },
  {
    displayId: 'ESC-2025-0002', 
    address: '456 Oak Avenue, Beverly Hills, CA 90210',
    status: 'Active',
    price: 2500000,
    acceptanceDate: '2025-01-10',
    closingDate: '2025-03-15'
  }
];

async function seedDatabase(pool, environment, suffix) {
  const client = await pool.connect();
  
  try {
    console.log(`\n🌱 Seeding ${environment} database...`);
    
    for (const escrow of escrowData) {
      try {
        // Check if we need to handle the id column differently
        const columnCheck = await client.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'escrows' AND column_name = 'id'
        `);
        
        const hasIdColumn = columnCheck.rows.length > 0;
        
        // Insert escrow - handle both old (id) and new (display_id) schemas
        let insertQuery;
        let values;
        
        if (hasIdColumn) {
          // Old schema with 'id' column
          insertQuery = `
            INSERT INTO escrows (
              id, property_address, escrow_status, purchase_price,
              earnest_money_deposit, down_payment, loan_amount,
              commission_percentage, gross_commission, net_commission,
              acceptance_date, closing_date, property_type, lead_source
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            ON CONFLICT (id) DO NOTHING
            RETURNING id
          `;
        } else {
          // New schema with 'display_id' column
          insertQuery = `
            INSERT INTO escrows (
              display_id, property_address, escrow_status, purchase_price,
              earnest_money_deposit, down_payment, loan_amount,
              commission_percentage, gross_commission, net_commission,
              acceptance_date, closing_date, property_type, lead_source
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            ON CONFLICT (display_id) DO NOTHING
            RETURNING display_id
          `;
        }
        
        values = [
          escrow.displayId,
          escrow.address + suffix, // Add environment suffix
          escrow.status,
          escrow.price,
          escrow.price * 0.01, // 1% earnest money
          escrow.price * 0.2,  // 20% down payment
          escrow.price * 0.8,  // 80% loan
          2.5, // commission percentage
          escrow.price * 0.025, // gross commission
          escrow.price * 0.025 * 0.5, // net commission (50% split)
          escrow.acceptanceDate,
          escrow.closingDate,
          'Single Family',
          'Referral'
        ];
        
        const result = await client.query(insertQuery, values);
        
        if (result.rows.length > 0) {
          console.log(`  ✓ Created escrow ${escrow.displayId}`);
          
          // Add checklist if table exists
          try {
            const checklistExists = await client.query(`
              SELECT 1 FROM information_schema.tables 
              WHERE table_name = 'escrow_checklists'
            `);
            
            if (checklistExists.rows.length > 0) {
              // Simple checklist items
              const checklistItems = [
                { phase: 'opening', task_name: 'Open Escrow', is_completed: false },
                { phase: 'opening', task_name: 'Earnest Money Deposit', is_completed: false },
                { phase: 'processing', task_name: 'Loan Application', is_completed: false },
                { phase: 'processing', task_name: 'Appraisal', is_completed: false },
                { phase: 'closing', task_name: 'Final Walkthrough', is_completed: false },
                { phase: 'closing', task_name: 'Fund Loan', is_completed: false }
              ];
              
              // Check which column name to use
              const columnName = hasIdColumn ? 'escrow_id' : 'escrow_display_id';
              
              await client.query(
                `INSERT INTO escrow_checklists (${columnName}, checklist_items) 
                 VALUES ($1, $2) 
                 ON CONFLICT (${columnName}) DO UPDATE SET checklist_items = $2`,
                [escrow.displayId, JSON.stringify(checklistItems)]
              );
              console.log(`    + Added checklist items`);
            }
          } catch (e) {
            // Ignore checklist errors
          }
        }
      } catch (error) {
        console.error(`  ❌ Error creating escrow ${escrow.displayId}:`, error.message);
      }
    }
    
    console.log(`✅ ${environment} database seeded successfully`);
    
  } catch (error) {
    console.error(`❌ Error seeding ${environment} database:`, error.message);
    throw error;
  } finally {
    client.release();
  }
}

async function seedIdenticalData() {
  try {
    // Seed local database
    await seedDatabase(localPool, 'LOCAL', ' - LOCAL');
    
    // Seed production if URL exists
    if (process.env.RAILWAY_DATABASE_URL || process.env.PRODUCTION_DATABASE_URL) {
      await seedDatabase(productionPool, 'PRODUCTION', ' - PRODUCTION');
      
      console.log('\n✅ Both databases have been seeded with identical data');
      console.log('   Local addresses end with: - LOCAL');
      console.log('   Production addresses end with: - PRODUCTION');
    }
    
  } catch (error) {
    console.error('❌ Failed to seed databases:', error);
  } finally {
    await localPool.end();
    if (process.env.RAILWAY_DATABASE_URL || process.env.PRODUCTION_DATABASE_URL) {
      await productionPool.end();
    }
  }
}

// Run the script
seedIdenticalData();