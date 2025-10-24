/**
 * Integration Test: Multi-Role Contacts System
 *
 * Tests the complete flow of assigning and managing multiple roles for contacts.
 *
 * Scenarios covered:
 * 1. Create contact with single role (lead_buyer)
 * 2. Add additional role (client) - verify source inheritance
 * 3. Search contacts by role
 * 4. Set primary role
 * 5. Remove role (with validation - can't remove last role)
 * 6. Verify role metadata persistence
 */

const request = require('supertest');
const app = require('../../app');
const { pool } = require('../../config/database');

describe('Multi-Role Contacts Integration Tests', () => {
  let authToken;
  let userId;
  let teamId;
  let contactId;
  let leadBuyerRoleId;
  let clientRoleId;
  let agentRoleId;

  // Setup: Create test user and get role IDs
  beforeAll(async () => {
    // Create test user
    const userResult = await pool.query(`
      INSERT INTO users (email, password_hash, first_name, last_name, username, role)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, team_id
    `, [
      'test-multirole@test.com',
      '$2b$10$abcdefghijklmnopqrstuvwxyz', // dummy hash
      'Test',
      'User',
      'testmultirole',
      'agent'
    ]);

    userId = userResult.rows[0].id;
    teamId = userResult.rows[0].team_id;

    // Login to get auth token
    const loginResponse = await request(app)
      .post('/v1/auth/login')
      .send({
        email: 'test-multirole@test.com',
        password: 'dummy' // Won't work without real hash, using direct token generation
      });

    // For testing, directly generate token
    const jwt = require('jsonwebtoken');
    authToken = jwt.sign(
      { id: userId, email: 'test-multirole@test.com', team_id: teamId },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    // Get role IDs from database
    const rolesResult = await pool.query(`
      SELECT id, role_name FROM contact_roles
      WHERE role_name IN ('lead_buyer', 'client', 'agent')
    `);

    rolesResult.rows.forEach(row => {
      if (row.role_name === 'lead_buyer') leadBuyerRoleId = row.id;
      if (row.role_name === 'client') clientRoleId = row.id;
      if (row.role_name === 'agent') agentRoleId = row.id;
    });

    expect(leadBuyerRoleId).toBeDefined();
    expect(clientRoleId).toBeDefined();
    expect(agentRoleId).toBeDefined();
  });

  // Cleanup: Remove test user and contact
  afterAll(async () => {
    if (contactId) {
      await pool.query('DELETE FROM contacts WHERE id = $1', [contactId]);
    }
    if (userId) {
      await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    }
  });

  // Test 1: Create contact with lead_buyer role
  test('POST /v1/contacts - Create contact with lead_buyer role', async () => {
    const response = await request(app)
      .post('/v1/contacts')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '555-1234',
        roles: [
          {
            role_id: leadBuyerRoleId,
            is_primary: true,
            role_metadata: {
              source: 'referral',
              budget: 500000,
              preferred_locations: ['Downtown', 'Suburbs']
            }
          }
        ]
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data.first_name).toBe('John');
    expect(response.body.data.last_name).toBe('Doe');

    contactId = response.body.data.id;
  });

  // Test 2: Verify contact roles
  test('GET /v1/contacts/:id/roles - Get contact roles', async () => {
    const response = await request(app)
      .get(`/v1/contacts/${contactId}/roles`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.data.length).toBe(1);
    expect(response.body.data[0].role_name).toBe('lead_buyer');
    expect(response.body.data[0].is_primary).toBe(true);
    expect(response.body.data[0].role_metadata).toHaveProperty('source', 'referral');
    expect(response.body.data[0].role_metadata).toHaveProperty('budget', 500000);
  });

  // Test 3: Add client role (should inherit source from lead_buyer)
  test('POST /v1/contacts/:id/roles - Add client role with source inheritance', async () => {
    const response = await request(app)
      .post(`/v1/contacts/${contactId}/roles`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        role_id: clientRoleId,
        is_primary: false,
        role_metadata: {} // Empty - should inherit source
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('role_metadata');

    // Verify source was inherited from lead role
    const metadata = JSON.parse(response.body.data.role_metadata);
    expect(metadata).toHaveProperty('source', 'referral');
  });

  // Test 4: Verify contact now has 2 roles
  test('GET /v1/contacts/:id/roles - Verify 2 roles after adding client', async () => {
    const response = await request(app)
      .get(`/v1/contacts/${contactId}/roles`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBe(2);

    // lead_buyer should still be primary
    const primary = response.body.data.find(r => r.is_primary);
    expect(primary.role_name).toBe('lead_buyer');

    // client should exist
    const client = response.body.data.find(r => r.role_name === 'client');
    expect(client).toBeDefined();
    expect(client.is_primary).toBe(false);
  });

  // Test 5: Search contacts by role (lead_buyer)
  test('GET /v1/contacts/search?role=lead_buyer - Search by role', async () => {
    const response = await request(app)
      .get('/v1/contacts/search')
      .query({ role: 'lead_buyer', name: 'John' })
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.data.length).toBeGreaterThan(0);

    // Our contact should be in results
    const found = response.body.data.find(c => c.id === contactId);
    expect(found).toBeDefined();
    expect(found.full_name).toContain('John');
  });

  // Test 6: Search contacts by role (client)
  test('GET /v1/contacts/search?role=client - Search by client role', async () => {
    const response = await request(app)
      .get('/v1/contacts/search')
      .query({ role: 'client', name: 'John' })
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    // Our contact should now appear in client searches too
    const found = response.body.data.find(c => c.id === contactId);
    expect(found).toBeDefined();
  });

  // Test 7: Set client as primary role
  test('PUT /v1/contacts/:id/roles/primary - Change primary role', async () => {
    const response = await request(app)
      .put(`/v1/contacts/${contactId}/roles/primary`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        role_id: clientRoleId
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    // Verify primary changed
    const rolesResponse = await request(app)
      .get(`/v1/contacts/${contactId}/roles`)
      .set('Authorization', `Bearer ${authToken}`);

    const primary = rolesResponse.body.data.find(r => r.is_primary);
    expect(primary.role_name).toBe('client');
  });

  // Test 8: Add agent role
  test('POST /v1/contacts/:id/roles - Add agent role', async () => {
    const response = await request(app)
      .post(`/v1/contacts/${contactId}/roles`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        role_id: agentRoleId,
        is_primary: false,
        role_metadata: {
          license_number: 'CA-12345',
          specialties: ['Residential', 'Commercial']
        }
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });

  // Test 9: Try to remove client role (should fail - can't remove primary)
  test('DELETE /v1/contacts/:id/roles/:roleId - Cannot remove last role', async () => {
    // First, remove lead_buyer and agent roles
    const rolesResponse = await request(app)
      .get(`/v1/contacts/${contactId}/roles`)
      .set('Authorization', `Bearer ${authToken}`);

    const leadBuyerAssignment = rolesResponse.body.data.find(r => r.role_name === 'lead_buyer');
    const agentAssignment = rolesResponse.body.data.find(r => r.role_name === 'agent');

    await request(app)
      .delete(`/v1/contacts/${contactId}/roles/${leadBuyerAssignment.role_id}`)
      .set('Authorization', `Bearer ${authToken}`);

    await request(app)
      .delete(`/v1/contacts/${contactId}/roles/${agentAssignment.role_id}`)
      .set('Authorization', `Bearer ${authToken}`);

    // Now try to remove client (last role) - should fail
    const response = await request(app)
      .delete(`/v1/contacts/${contactId}/roles/${clientRoleId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(response.body.error.message).toContain('Cannot remove last role');
  });

  // Test 10: Duplicate role assignment (should fail)
  test('POST /v1/contacts/:id/roles - Cannot add duplicate role', async () => {
    const response = await request(app)
      .post(`/v1/contacts/${contactId}/roles`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        role_id: clientRoleId, // Already has client role
        is_primary: false
      });

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('DUPLICATE_ROLE');
  });

  // Test 11: Search without role filter (should return contact)
  test('GET /v1/contacts/search - Search all roles', async () => {
    const response = await request(app)
      .get('/v1/contacts/search')
      .query({ name: 'John Doe' })
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);

    const found = response.body.data.find(c => c.id === contactId);
    expect(found).toBeDefined();
  });

  // Test 12: Update contact basic info (should not affect roles)
  test('PUT /v1/contacts/:id - Update contact info without affecting roles', async () => {
    const response = await request(app)
      .put(`/v1/contacts/${contactId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        first_name: 'John',
        last_name: 'Smith', // Changed last name
        phone: '555-9999'
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.last_name).toBe('Smith');

    // Verify roles unchanged
    const rolesResponse = await request(app)
      .get(`/v1/contacts/${contactId}/roles`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(rolesResponse.body.data.length).toBe(1); // Still has client role
  });
});

module.exports = {};
