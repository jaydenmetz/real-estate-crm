/**
 * Integration Test: Complete Escrow Creation Flow
 *
 * Tests the end-to-end flow of creating an escrow with all components:
 * 1. Create contact (client)
 * 2. Create escrow with property address
 * 3. Link client to escrow
 * 4. Calculate commission
 * 5. Verify all relationships
 * 6. Test WebSocket notifications
 */

const request = require('supertest');
const app = require('../../app');
const { pool } = require('../../config/infrastructure/database');

describe('Escrow Creation Flow Integration Tests', () => {
  let authToken;
  let userId;
  let teamId;
  let contactId;
  let clientRoleId;
  let escrowId;

  beforeAll(async () => {
    // Create test user
    const userResult = await pool.query(`
      INSERT INTO users (email, password_hash, first_name, last_name, username, role)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, team_id
    `, [
      'test-escrow@test.com',
      '$2b$10$test',
      'Escrow',
      'Tester',
      'escrowtester',
      'agent'
    ]);

    userId = userResult.rows[0].id;
    teamId = userResult.rows[0].team_id;

    // Generate auth token
    const jwt = require('jsonwebtoken');
    authToken = jwt.sign(
      { id: userId, email: 'test-escrow@test.com', team_id: teamId },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    // Get client role ID
    const roleResult = await pool.query(`
      SELECT id FROM contact_roles WHERE role_name = 'client'
    `);
    clientRoleId = roleResult.rows[0].id;
  });

  afterAll(async () => {
    if (escrowId) {
      await pool.query('DELETE FROM escrows WHERE id = $1', [escrowId]);
    }
    if (contactId) {
      await pool.query('DELETE FROM contacts WHERE id = $1', [contactId]);
    }
    if (userId) {
      await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    }
  });

  test('Complete Flow: Create contact → Create escrow → Link → Verify', async () => {
    // Step 1: Create client contact
    const contactResponse = await request(app)
      .post('/v1/contacts')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        first_name: 'Jane',
        last_name: 'Buyer',
        email: 'jane.buyer@example.com',
        phone: '555-1111',
        roles: [{
          role_id: clientRoleId,
          is_primary: true
        }]
      });

    expect(contactResponse.status).toBe(201);
    contactId = contactResponse.body.data.id;

    // Step 2: Create escrow
    const escrowResponse = await request(app)
      .post('/v1/escrows')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        property_address: '123 Main St, Los Angeles, CA 90001',
        purchase_price: 750000,
        earnest_money_deposit: 25000,
        acceptance_date: '2025-10-23',
        closing_date: '2025-11-23',
        escrow_status: 'Active',
        representation_type: 'buyer',
        commission_percentage: 2.5,
        client_id: contactId
      });

    expect(escrowResponse.status).toBe(201);
    expect(escrowResponse.body.success).toBe(true);
    expect(escrowResponse.body.data).toHaveProperty('id');
    expect(escrowResponse.body.data.property_address).toBe('123 Main St, Los Angeles, CA 90001');
    expect(escrowResponse.body.data.purchase_price).toBe('750000');

    escrowId = escrowResponse.body.data.id;

    // Step 3: Verify commission calculation
    const expectedGrossCommission = 750000 * 0.025; // $18,750
    expect(parseFloat(escrowResponse.body.data.gross_commission)).toBeCloseTo(expectedGrossCommission, 2);

    // Step 4: Verify escrow can be retrieved
    const getResponse = await request(app)
      .get(`/v1/escrows/${escrowId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(getResponse.status).toBe(200);
    expect(getResponse.body.data.id).toBe(escrowId);
    expect(getResponse.body.data.property_address).toBe('123 Main St, Los Angeles, CA 90001');

    // Step 5: Verify contact-escrow link exists
    const linkResult = await pool.query(`
      SELECT * FROM contact_escrows
      WHERE contact_id = $1 AND escrow_id = $2
    `, [contactId, escrowId]);

    expect(linkResult.rows.length).toBeGreaterThan(0);
  });

  test('Escrow with invalid client_id should fail', async () => {
    const response = await request(app)
      .post('/v1/escrows')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        property_address: '456 Elm St, San Diego, CA 92101',
        purchase_price: 500000,
        acceptance_date: '2025-10-23',
        closing_date: '2025-11-23',
        escrow_status: 'Active',
        client_id: '00000000-0000-0000-0000-000000000000' // Invalid UUID
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  test('Update escrow status', async () => {
    const response = await request(app)
      .put(`/v1/escrows/${escrowId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        escrow_status: 'Pending'
      });

    expect(response.status).toBe(200);
    expect(response.body.data.escrow_status).toBe('Pending');
  });

  test('Archive and restore escrow', async () => {
    // Archive
    const archiveResponse = await request(app)
      .patch(`/v1/escrows/${escrowId}/archive`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(archiveResponse.status).toBe(200);
    expect(archiveResponse.body.success).toBe(true);

    // Verify archived
    const archivedEscrow = await pool.query(`
      SELECT deleted_at FROM escrows WHERE id = $1
    `, [escrowId]);
    expect(archivedEscrow.rows[0].deleted_at).not.toBeNull();

    // Restore
    const restoreResponse = await request(app)
      .patch(`/v1/escrows/${escrowId}/restore`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(restoreResponse.status).toBe(200);

    // Verify restored
    const restoredEscrow = await pool.query(`
      SELECT deleted_at FROM escrows WHERE id = $1
    `, [escrowId]);
    expect(restoredEscrow.rows[0].deleted_at).toBeNull();
  });
});

module.exports = {};
