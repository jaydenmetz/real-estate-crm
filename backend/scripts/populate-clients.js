const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

// Use Railway database
const pool = new Pool({
  connectionString: process.env.RAILWAY_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const testClients = [
  {
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '(310) 555-0101',
    client_type: 'buyer',
    status: 'active',
    address: '123 Main St, Los Angeles, CA 90001',
    notes: 'Looking for single family home in West LA',
    tags: ['first-time-buyer', 'pre-approved'],
    lead_source: 'Website',
    preferred_contact_method: 'email'
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    phone: '(424) 555-0202',
    client_type: 'seller',
    status: 'active',
    address: '456 Oak Ave, Santa Monica, CA 90405',
    notes: 'Selling investment property',
    tags: ['investor', 'multiple-properties'],
    lead_source: 'Referral',
    preferred_contact_method: 'phone'
  },
  {
    name: 'Michael Chen',
    email: 'michael.chen@example.com',
    phone: '(818) 555-0303',
    client_type: 'buyer',
    status: 'active',
    address: '789 Pine Rd, Pasadena, CA 91101',
    notes: 'Cash buyer, looking for luxury properties',
    tags: ['luxury', 'cash-buyer'],
    lead_source: 'Agent Network',
    preferred_contact_method: 'email'
  },
  {
    name: 'Emily Davis',
    email: 'emily.davis@example.com',
    phone: '(213) 555-0404',
    client_type: 'buyer',
    status: 'active',
    address: '321 Elm St, Beverly Hills, CA 90210',
    notes: 'Relocating from New York',
    tags: ['relocation', 'urgent'],
    lead_source: 'Corporate Relocation',
    preferred_contact_method: 'phone'
  },
  {
    name: 'Robert Wilson',
    email: 'robert.wilson@example.com',
    phone: '(626) 555-0505',
    client_type: 'seller',
    status: 'active',
    address: '654 Maple Dr, Glendale, CA 91201',
    notes: 'Downsizing to condo',
    tags: ['downsizing', 'senior'],
    lead_source: 'Past Client',
    preferred_contact_method: 'email'
  }
];

async function populateClients() {
  const client = await pool.connect();
  
  try {
    console.log('🧑‍🤝‍🧑 Populating clients table...\n');
    
    let successCount = 0;
    
    for (const clientData of testClients) {
      try {
        // Check if client already exists
        const existingCheck = await client.query(
          'SELECT id FROM clients WHERE email = $1',
          [clientData.email]
        );
        
        if (existingCheck.rows.length > 0) {
          console.log(`⚠️  ${clientData.name} already exists`);
          continue;
        }
        
        // Insert client
        const insertQuery = `
          INSERT INTO clients (
            name, email, phone, client_type, status,
            address, notes, tags, lead_source, preferred_contact_method,
            created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
          RETURNING id, name, email
        `;
        
        const result = await client.query(insertQuery, [
          clientData.name,
          clientData.email,
          clientData.phone,
          clientData.client_type,
          clientData.status,
          clientData.address,
          clientData.notes,
          JSON.stringify(clientData.tags),
          clientData.lead_source,
          clientData.preferred_contact_method
        ]);
        
        console.log(`✅ Created ${clientData.client_type}: ${result.rows[0].name}`);
        successCount++;
        
      } catch (err) {
        console.error(`❌ Failed to create ${clientData.name}:`, err.message);
      }
    }
    
    // Get total count
    const countResult = await client.query('SELECT COUNT(*) as total FROM clients');
    console.log(`\n📊 Total clients in database: ${countResult.rows[0].total}`);
    console.log(`✅ Successfully created ${successCount} new clients`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

populateClients();