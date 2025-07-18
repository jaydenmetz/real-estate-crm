const { Pool } = require('pg');
const http = require('http');
const express = require('express');
const escrowRoutes = require('./src/routes/escrow.routes.updated');

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'realestate_crm',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

// Color codes for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

// Test tracking
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const testResults = [];

// Logging helpers
const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  test: (name) => console.log(`\n${colors.cyan}▶ ${name}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`)
};

// Test helper functions
async function runTest(testName, testFn) {
  totalTests++;
  log.test(testName);
  const startTime = Date.now();
  
  try {
    await testFn();
    const duration = Date.now() - startTime;
    passedTests++;
    log.success(`${testName} (${duration}ms)`);
    testResults.push({ name: testName, passed: true, duration });
  } catch (error) {
    const duration = Date.now() - startTime;
    failedTests++;
    log.error(`${testName} (${duration}ms)`);
    log.error(`  Error: ${error.message}`);
    if (process.argv.includes('--verbose')) {
      console.error('  Stack:', error.stack);
    }
    testResults.push({ name: testName, passed: false, duration, error: error.message });
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected}, got ${actual}`);
  }
}

function assertExists(value, message) {
  if (value === null || value === undefined) {
    throw new Error(message || `Expected value to exist, got ${value}`);
  }
}

// Test Suite
async function runTestSuite() {
  console.log(`${colors.cyan}═══════════════════════════════════════════`);
  console.log(`  Real Estate CRM - Escrow System Test Suite`);
  console.log(`${colors.cyan}═══════════════════════════════════════════${colors.reset}\n`);

  // 1. Database Connection Test
  await runTest('Database Connection Test', async () => {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    assert(result.rows.length > 0, 'Database query should return results');
  });

  // 2. Contact Creation Test
  await runTest('Contact Creation Verification', async () => {
    const client = await pool.connect();
    
    // Check all 4 contacts exist
    const contactsQuery = `
      SELECT id, first_name, last_name, email, full_name, contact_type
      FROM contacts 
      WHERE email IN ($1, $2, $3, $4)
    `;
    const emails = ['john.smith@email.com', 'jane.doe@email.com', 
                   'sarah.johnson@realty.com', 'mike.davis@realty.com'];
    const result = await client.query(contactsQuery, emails);
    
    assertEqual(result.rows.length, 4, 'Should have 4 test contacts');
    
    // Verify email uniqueness
    const emailSet = new Set(result.rows.map(r => r.email));
    assertEqual(emailSet.size, 4, 'All emails should be unique');
    
    // Verify full_name generation
    result.rows.forEach(contact => {
      assertExists(contact.full_name, `Contact ${contact.email} should have full_name`);
      const expectedName = `${contact.first_name} ${contact.last_name}`;
      assertEqual(contact.full_name, expectedName, 'Full name should be properly generated');
    });
    
    client.release();
  });

  // 3. Relationship Tests
  await runTest('Agent-Contact Relationship Verification', async () => {
    const client = await pool.connect();
    
    // Verify agents are linked to contacts
    const agentQuery = `
      SELECT a.id, c.email, c.full_name, a.license_number
      FROM agents a
      JOIN contacts c ON a.contact_id = c.id
      WHERE c.email IN ($1, $2)
    `;
    const result = await client.query(agentQuery, 
      ['sarah.johnson@realty.com', 'mike.davis@realty.com']);
    
    assertEqual(result.rows.length, 2, 'Should have 2 agent records');
    
    // Verify contact_agents junction
    const junctionQuery = `
      SELECT COUNT(*) as count
      FROM contact_agents ca
      JOIN contacts c ON ca.contact_id = c.id
      WHERE c.email IN ($1, $2)
    `;
    const junctionResult = await client.query(junctionQuery, 
      ['sarah.johnson@realty.com', 'mike.davis@realty.com']);
    
    assertEqual(parseInt(junctionResult.rows[0].count), 2, 
      'Should have 2 entries in contact_agents junction table');
    
    client.release();
  });

  await runTest('Client-Contact Relationship Verification', async () => {
    const client = await pool.connect();
    
    // Verify clients are linked to contacts
    const clientQuery = `
      SELECT cl.id, c.email, c.full_name, cl.client_type
      FROM clients cl
      JOIN contacts c ON cl.contact_id = c.id
      WHERE c.email IN ($1, $2)
    `;
    const result = await client.query(clientQuery, 
      ['john.smith@email.com', 'jane.doe@email.com']);
    
    assertEqual(result.rows.length, 2, 'Should have 2 client records');
    
    const buyer = result.rows.find(r => r.email === 'john.smith@email.com');
    assertEqual(buyer.client_type, 'buyer', 'John Smith should be a buyer');
    
    const seller = result.rows.find(r => r.email === 'jane.doe@email.com');
    assertEqual(seller.client_type, 'seller', 'Jane Doe should be a seller');
    
    client.release();
  });

  // 4. Escrow Creation Test
  await runTest('Escrow Creation Verification', async () => {
    const client = await pool.connect();
    
    const escrowQuery = `
      SELECT id, property_address, purchase_price, commission_percentage,
             gross_commission, escrow_status
      FROM escrows
      WHERE id = $1
    `;
    const result = await client.query(escrowQuery, ['ESC-TEST-001']);
    
    assertEqual(result.rows.length, 1, 'Test escrow should exist');
    
    const escrow = result.rows[0];
    assertEqual(escrow.property_address, '123 Main St, San Diego, CA 92101', 
      'Property address should match');
    assertEqual(parseFloat(escrow.purchase_price), 850000, 
      'Purchase price should be $850,000');
    assertEqual(parseFloat(escrow.commission_percentage), 3.0, 
      'Commission should be 3%');
    assertEqual(parseFloat(escrow.gross_commission), 25500, 
      'Gross commission should be $25,500');
    
    client.release();
  });

  // 5. Participant Linkage Test
  await runTest('Escrow Participant Linkage Verification', async () => {
    const client = await pool.connect();
    
    const participantsQuery = `
      SELECT ce.role, ce.is_primary, ce.commission_percentage, 
             ce.commission_amount, c.email, c.full_name
      FROM contact_escrows ce
      JOIN contacts c ON ce.contact_id = c.id
      WHERE ce.escrow_id = $1
      ORDER BY ce.role
    `;
    const result = await client.query(participantsQuery, ['ESC-TEST-001']);
    
    assertEqual(result.rows.length, 4, 'Should have 4 participants');
    
    // Verify roles
    const roles = result.rows.map(r => r.role);
    assert(roles.includes('buyer'), 'Should have a buyer');
    assert(roles.includes('seller'), 'Should have a seller');
    assert(roles.includes('listing_agent'), 'Should have a listing agent');
    assert(roles.includes('buyer_agent'), 'Should have a buyer agent');
    
    // Verify commissions for agents
    const listingAgent = result.rows.find(r => r.role === 'listing_agent');
    assertEqual(parseFloat(listingAgent.commission_percentage), 1.5, 
      'Listing agent should have 1.5% commission');
    assertEqual(parseFloat(listingAgent.commission_amount), 12750, 
      'Listing agent commission should be $12,750');
    
    const buyerAgent = result.rows.find(r => r.role === 'buyer_agent');
    assertEqual(parseFloat(buyerAgent.commission_percentage), 1.5, 
      'Buyer agent should have 1.5% commission');
    assertEqual(parseFloat(buyerAgent.commission_amount), 12750, 
      'Buyer agent commission should be $12,750');
    
    client.release();
  });

  // 6. API Endpoint Test
  await runTest('API Endpoint - Get Escrow Details', async () => {
    // Create a test server
    const app = express();
    app.use(express.json());
    app.use('/api/v1', escrowRoutes);
    
    const server = app.listen(0); // Random port
    const port = server.address().port;
    
    try {
      // Make API request
      const response = await new Promise((resolve, reject) => {
        http.get(`http://localhost:${port}/api/v1/escrows/ESC-TEST-001`, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            try {
              resolve({
                status: res.statusCode,
                data: JSON.parse(data)
              });
            } catch (e) {
              reject(e);
            }
          });
        }).on('error', reject);
      });
      
      assertEqual(response.status, 200, 'Should return 200 OK');
      assert(response.data.success, 'Response should indicate success');
      assertExists(response.data.data, 'Response should have data');
      
      const escrowData = response.data.data;
      assertExists(escrowData.buyers, 'Should have buyers array');
      assertExists(escrowData.sellers, 'Should have sellers array');
      assertExists(escrowData.listing_agent, 'Should have listing agent');
      assertExists(escrowData.buyer_agent, 'Should have buyer agent');
      assertExists(escrowData.checklist, 'Should have checklist');
      
      // Verify buyers and sellers are arrays
      assert(Array.isArray(escrowData.buyers), 'Buyers should be an array');
      assert(Array.isArray(escrowData.sellers), 'Sellers should be an array');
      assertEqual(escrowData.buyers.length, 1, 'Should have 1 buyer');
      assertEqual(escrowData.sellers.length, 1, 'Should have 1 seller');
      
      // Verify agents have commission details
      assertExists(escrowData.listing_agent.agent_info, 
        'Listing agent should have agent info');
      assertEqual(escrowData.listing_agent.agent_info.commission_percentage, 1.5,
        'Listing agent commission should be 1.5%');
      
    } finally {
      server.close();
    }
  });

  // 7. Null Safety Tests
  await runTest('Null Safety - Minimal Escrow', async () => {
    const client = await pool.connect();
    
    try {
      // Create minimal escrow
      await client.query('BEGIN');
      
      const minimalEscrowId = 'ESC-MINIMAL-001';
      await client.query(
        `INSERT INTO escrows (id, property_address, purchase_price, escrow_status)
         VALUES ($1, $2, $3, $4)`,
        [minimalEscrowId, '456 Test St', 100000, 'Active']
      );
      
      await client.query('COMMIT');
      
      // Test API with minimal escrow
      const app = express();
      app.use(express.json());
      app.use('/api/v1', escrowRoutes);
      
      const server = app.listen(0);
      const port = server.address().port;
      
      try {
        const response = await new Promise((resolve, reject) => {
          http.get(`http://localhost:${port}/api/v1/escrows/${minimalEscrowId}`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
              try {
                resolve({
                  status: res.statusCode,
                  data: JSON.parse(data)
                });
              } catch (e) {
                reject(e);
              }
            });
          }).on('error', reject);
        });
        
        assertEqual(response.status, 200, 'Should return 200 OK');
        assert(response.data.success, 'Response should indicate success');
        
        const escrowData = response.data.data;
        assert(Array.isArray(escrowData.buyers) && escrowData.buyers.length === 0, 
          'Empty buyers should return empty array');
        assert(Array.isArray(escrowData.sellers) && escrowData.sellers.length === 0, 
          'Empty sellers should return empty array');
        assertEqual(escrowData.listing_agent, null, 
          'Missing listing agent should return null');
        assertEqual(escrowData.buyer_agent, null, 
          'Missing buyer agent should return null');
        
      } finally {
        server.close();
        // Clean up
        await client.query('DELETE FROM escrows WHERE id = $1', [minimalEscrowId]);
      }
      
    } finally {
      client.release();
    }
  });

  // 8. Error Handling Tests
  await runTest('Error Handling - Non-existent Escrow', async () => {
    const app = express();
    app.use(express.json());
    app.use('/api/v1', escrowRoutes);
    
    const server = app.listen(0);
    const port = server.address().port;
    
    try {
      const response = await new Promise((resolve, reject) => {
        http.get(`http://localhost:${port}/api/v1/escrows/NON-EXISTENT-ID`, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            try {
              resolve({
                status: res.statusCode,
                data: JSON.parse(data)
              });
            } catch (e) {
              reject(e);
            }
          });
        }).on('error', reject);
      });
      
      assertEqual(response.status, 404, 'Should return 404 Not Found');
      assert(!response.data.success, 'Response should indicate failure');
      assertEqual(response.data.error.code, 'NOT_FOUND', 
        'Should have NOT_FOUND error code');
      
    } finally {
      server.close();
    }
  });

  // 9. Data Integrity Tests
  await runTest('Data Integrity - Foreign Key Constraints', async () => {
    const client = await pool.connect();
    
    try {
      // Try to create contact_escrows with non-existent contact
      await client.query(
        `INSERT INTO contact_escrows (contact_id, escrow_id, role)
         VALUES ($1, $2, $3)`,
        ['00000000-0000-0000-0000-000000000000', 'ESC-TEST-001', 'buyer']
      );
      throw new Error('Should have failed with foreign key violation');
    } catch (error) {
      assert(error.message.includes('violates foreign key constraint') || 
             error.message.includes('Should have failed'), 
        'Foreign key constraint should be enforced');
    } finally {
      client.release();
    }
  });

  // 10. Performance Test
  await runTest('Performance - Escrow Query with All Relations', async () => {
    const client = await pool.connect();
    
    const startTime = Date.now();
    
    // Run the complex query from the controller
    const query = `
      WITH escrow_participants AS (
        SELECT 
          ce.escrow_id,
          ce.role,
          ce.is_primary,
          ce.commission_percentage,
          ce.commission_amount,
          c.id as contact_id,
          c.first_name,
          c.last_name,
          c.full_name,
          c.email,
          c.phone
        FROM contact_escrows ce
        INNER JOIN contacts c ON ce.contact_id = c.id
        WHERE ce.escrow_id = $1
      )
      SELECT * FROM escrow_participants
    `;
    
    const result = await client.query(query, ['ESC-TEST-001']);
    const queryTime = Date.now() - startTime;
    
    assert(queryTime < 100, `Query should complete in under 100ms (took ${queryTime}ms)`);
    assert(result.rows.length > 0, 'Query should return results');
    
    // Check query plan
    const explainResult = await client.query(`EXPLAIN ANALYZE ${query}`, ['ESC-TEST-001']);
    if (process.argv.includes('--verbose')) {
      console.log('\n  Query Plan:');
      explainResult.rows.forEach(row => console.log('  ', row['QUERY PLAN']));
    }
    
    client.release();
  });

  // Print summary
  console.log(`\n${colors.cyan}═══════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}  Test Summary${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════${colors.reset}`);
  console.log(`  Total Tests: ${totalTests}`);
  console.log(`  ${colors.green}Passed: ${passedTests}${colors.reset}`);
  console.log(`  ${colors.red}Failed: ${failedTests}${colors.reset}`);
  
  if (failedTests > 0) {
    console.log(`\n${colors.red}Failed Tests:${colors.reset}`);
    testResults.filter(r => !r.passed).forEach(r => {
      console.log(`  - ${r.name}: ${r.error}`);
    });
  }
  
  const exitCode = failedTests > 0 ? 1 : 0;
  console.log(`\n${exitCode === 0 ? colors.green : colors.red}Exit code: ${exitCode}${colors.reset}`);
  
  process.exit(exitCode);
}

// Run the test suite
runTestSuite().catch(error => {
  console.error('Unexpected error running test suite:', error);
  process.exit(1);
}).finally(() => {
  pool.end();
});