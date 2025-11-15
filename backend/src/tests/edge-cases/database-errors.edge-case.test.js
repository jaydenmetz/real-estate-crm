const request = require('supertest');
const app = require('../../app');
const { pool } = require('../../config/infrastructure/database');

describe('Database Error Handling Edge Cases', () => {
  let authToken;

  beforeAll(async () => {
    const loginResponse = await request(app)
      .post('/v1/auth/login')
      .send({
        email: 'admin@jaydenmetz.com',
        password: 'AdminPassword123!',
      });

    authToken = loginResponse.body.data.token;
  });

  afterAll(async () => {
    await pool.end();
  });

  // Test 1: Constraint violation (duplicate unique key)
  it('should handle unique constraint violation gracefully', async () => {
    const uniqueEmail = `duplicate.${Date.now()}@example.com`;

    // Create first client
    const response1 = await request(app)
      .post('/v1/clients')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        firstName: 'John',
        lastName: 'Duplicate',
        email: uniqueEmail,
        clientType: 'Buyer',
      });

    expect(response1.status).toBe(201);
    const clientId = response1.body.data.id;

    // Try to create duplicate
    const response2 = await request(app)
      .post('/v1/clients')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        firstName: 'Jane',
        lastName: 'Duplicate',
        email: uniqueEmail, // Same email
        clientType: 'Seller',
      });

    expect(response2.status).toBe(400);
    expect(response2.body.success).toBe(false);
    expect(response2.body.error.message).toMatch(/duplicate|exist|already/i);

    // Cleanup
    await pool.query('DELETE FROM clients WHERE id = $1', [clientId]);
  });

  // Test 2: Foreign key constraint violation
  it('should handle foreign key constraint violation', async () => {
    const nonExistentClientId = '00000000-0000-0000-0000-000000000099';

    const response = await request(app)
      .post('/v1/escrows')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        propertyAddress: '123 Test St',
        purchasePrice: 500000,
        status: 'active',
        clientId: nonExistentClientId, // Non-existent foreign key
      });

    // Should gracefully handle (either 400 or 404)
    expect([400, 404, 500]).toContain(response.status);
    expect(response.body.success).toBe(false);
  });

  // Test 3: Query timeout handling
  it('should handle slow queries gracefully', async () => {
    // This test verifies the API responds even if query is slow
    // Real timeout testing would require a slow query or mock

    const response = await request(app)
      .get('/v1/escrows?page=1&limit=1000') // Large limit might be slow
      .set('Authorization', `Bearer ${authToken}`);

    // Should respond (not timeout)
    expect(response.status).toBeDefined();
    expect([200, 400]).toContain(response.status);
  }, 10000); // 10 second timeout

  // Test 4: Invalid UUID format
  it('should handle invalid UUID format gracefully', async () => {
    const invalidId = 'not-a-valid-uuid';

    const response = await request(app)
      .get(`/v1/escrows/${invalidId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.message).toMatch(/invalid|uuid|format/i);
  });

  // Test 5: Concurrent update conflict (version mismatch)
  it('should handle concurrent update conflicts (optimistic locking)', async () => {
    // Create an escrow
    const createResponse = await request(app)
      .post('/v1/escrows')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        propertyAddress: '123 Concurrency Test St',
        city: 'Tehachapi',
        state: 'CA',
        zipCode: '93561',
        purchasePrice: 500000,
        status: 'active',
        escrowNumber: `CONCUR-${Date.now()}`,
      });

    const escrowId = createResponse.body.data.id;
    const { version } = createResponse.body.data;

    // First update (should succeed)
    const update1 = await request(app)
      .put(`/v1/escrows/${escrowId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        status: 'pending',
        version,
      });

    expect(update1.status).toBe(200);

    // Second update with stale version (should fail)
    const update2 = await request(app)
      .put(`/v1/escrows/${escrowId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        status: 'closed',
        version, // Stale version
      });

    expect(update2.status).toBe(409);
    expect(update2.body.error.code).toBe('VERSION_CONFLICT');

    // Cleanup
    await pool.query('DELETE FROM escrows WHERE id = $1', [escrowId]);
  });
});
