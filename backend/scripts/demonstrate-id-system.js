const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const pool = new Pool({
  connectionString: process.env.RAILWAY_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function demonstrateIdSystem() {
  const client = await pool.connect();
  
  try {
    console.log('🎯 Demonstrating the Three-Tier ID System\n');
    
    // Get team
    const teamResult = await client.query(`
      SELECT team_id, name FROM teams WHERE subdomain = 'jaydenmetz' LIMIT 1
    `);
    
    if (teamResult.rows.length === 0) {
      console.log('❌ No team found');
      return;
    }
    
    const team = teamResult.rows[0];
    console.log(`📍 Team: ${team.name}\n`);
    
    // Create examples for each entity type
    const entities = [
      {
        type: 'listing',
        table: 'listings',
        data: {
          property_address: '456 Maple Street, Los Angeles, CA 90001',
          list_price: 750000,
          listing_status: 'Active',
          mls_number: 'MLS789012',
          bedrooms: 4,
          bathrooms: 3,
          square_feet: 2200
        }
      },
      {
        type: 'client',
        table: 'clients',
        data: {
          client_type: 'Buyer',
          status: 'Active',
          price_range_min: 500000,
          price_range_max: 800000
        }
      },
      {
        type: 'lead',
        table: 'leads',
        data: {
          first_name: 'John',
          last_name: 'Smith',
          email: 'john.smith@example.com',
          phone: '555-1234',
          lead_source: 'Website',
          lead_status: 'New'
        }
      },
      {
        type: 'appointment',
        table: 'appointments',
        data: {
          title: 'Property Showing - 456 Maple Street',
          appointment_date: '2025-02-01',
          start_time: '14:00',
          end_time: '15:00',
          location: '456 Maple Street',
          appointment_type: 'Showing',
          status: 'Scheduled'
        }
      }
    ];
    
    console.log('📝 Creating sample records with three-tier IDs:\n');
    
    for (const entity of entities) {
      try {
        // Build insert query dynamically
        const columns = Object.keys(entity.data);
        const values = Object.values(entity.data);
        const placeholders = columns.map((_, i) => `$${i + 2}`).join(', ');
        
        const query = `
          INSERT INTO ${entity.table} (
            id, team_id, ${columns.join(', ')}, created_at
          ) VALUES (
            gen_random_uuid(), $1, ${placeholders}, NOW()
          )
          RETURNING 
            team_sequence_id,
            display_id,
            global_id
        `;
        
        const result = await client.query(query, [team.team_id, ...values]);
        
        if (result.rows.length > 0) {
          const record = result.rows[0];
          console.log(`✅ ${entity.type.toUpperCase()}:`);
          console.log(`   Simple ID:  #${record.team_sequence_id}`);
          console.log(`   Display ID: ${record.display_id}`);
          console.log(`   Global ID:  ${record.global_id}`);
          console.log('');
        }
      } catch (error) {
        console.log(`⚠️  ${entity.type}: ${error.message}\n`);
      }
    }
    
    // Show summary of all records
    console.log('📊 Summary of All Records by Entity Type:\n');
    
    const summaryTables = [
      { table: 'escrows', name: 'ESCROWS', prefix: 'ESC' },
      { table: 'listings', name: 'LISTINGS', prefix: 'LISTING' },
      { table: 'clients', name: 'CLIENTS', prefix: 'CLIENT' },
      { table: 'leads', name: 'LEADS', prefix: 'LEAD' },
      { table: 'appointments', name: 'APPOINTMENTS', prefix: 'APPT' }
    ];
    
    for (const summary of summaryTables) {
      try {
        const count = await client.query(`
          SELECT COUNT(*) as total
          FROM ${summary.table}
          WHERE team_id = $1
        `, [team.team_id]);
        
        const latest = await client.query(`
          SELECT team_sequence_id, display_id
          FROM ${summary.table}
          WHERE team_id = $1
          ORDER BY team_sequence_id DESC
          LIMIT 1
        `, [team.team_id]);
        
        if (count.rows[0].total > 0 && latest.rows.length > 0) {
          console.log(`${summary.name}:`);
          console.log(`   Total: ${count.rows[0].total} records`);
          console.log(`   Latest: #${latest.rows[0].team_sequence_id} → ${latest.rows[0].display_id}`);
          console.log('');
        }
      } catch (error) {
        // Skip
      }
    }
    
    console.log('💡 How the System Works:\n');
    console.log('1. Simple ID (#1, #2, #3...)');
    console.log('   - Increments per entity type within each team');
    console.log('   - Easy for users to reference\n');
    
    console.log('2. Display ID (LISTING-2025-001)');
    console.log('   - Professional format for documents');
    console.log('   - Includes entity type, year, and sequence');
    console.log('   - Resets yearly per team\n');
    
    console.log('3. Global ID (listing-550e8400-e29b...)');
    console.log('   - UUID with entity prefix');
    console.log('   - Globally unique across all teams');
    console.log('   - Used for API and system routing');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

demonstrateIdSystem();