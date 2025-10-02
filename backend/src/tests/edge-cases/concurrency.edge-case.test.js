const request = require('supertest');
const app = require('../../app');
const { pool } = require('../../config/database');

describe('Concurrent Request Handling', () => {
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

  // Test 1: Parallel read requests
  it('should handle 50 parallel read requests without errors', async () => {
    const promises = Array(50).fill(null).map(() => request(app)
      .get('/v1/escrows')
      .set('Authorization', `Bearer ${authToken}`));

    const responses = await Promise.all(promises);

    // All should succeed
    responses.forEach((response) => {
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  }, 30000);

  // Test 2: Concurrent writes to different resources
  it('should handle concurrent write operations to different resources', async () => {
    const promises = Array(10).fill(null).map((_, i) => request(app)
      .post('/v1/clients')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        firstName: 'Concurrent',
        lastName: `Client${i}`,
        email: `concurrent.${Date.now()}.${i}@example.com`,
        clientType: 'Buyer',
      }));

    const responses = await Promise.all(promises);

    // All should succeed
    const successful = responses.filter((r) => r.status === 201);
    expect(successful.length).toBe(10);

    // Cleanup
    const clientIds = successful.map((r) => r.body.data.id);
    for (const id of clientIds) {
      await pool.query('DELETE FROM clients WHERE id = $1', [id]);
    }
  }, 30000);

  // Test 3: Concurrent updates to same resource (race condition)
  it('should handle concurrent updates to same resource safely', async () => {
    // Create a test escrow
    const createResponse = await request(app)
      .post('/v1/escrows')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        propertyAddress: '123 Race Condition Test St',
        city: 'Tehachapi',
        state: 'CA',
        zipCode: '93561',
        purchasePrice: 500000,
        status: 'active',
        escrowNumber: `RACE-${Date.now()}`,
      });

    const escrowId = createResponse.body.data.id;
    const { version } = createResponse.body.data;

    // Try to update same escrow concurrently with same version
    const updatePromises = Array(5).fill(null).map((_, i) => request(app)
      .put(`/v1/escrows/${escrowId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        status: i % 2 === 0 ? 'pending' : 'active',
        version,
      }));

    const responses = await Promise.all(updatePromises);

    // Only one should succeed (200), others should fail with version conflict (409)
    const successful = responses.filter((r) => r.status === 200);
    const conflicts = responses.filter((r) => r.status === 409);

    expect(successful.length).toBe(1);
    expect(conflicts.length).toBe(4);

    // Cleanup
    await pool.query('DELETE FROM escrows WHERE id = $1', [escrowId]);
  }, 30000);

  // Test 4: Concurrent registration attempts with same email
  it('should prevent duplicate registrations with same email', async () => {
    const testEmail = `race.condition.${Date.now()}@example.com`;

    const promises = Array(5).fill(null).map(() => request(app)
      .post('/v1/auth/register')
      .send({
        email: testEmail,
        password: 'TestPassword123!',
        firstName: 'Race',
        lastName: 'Test',
        role: 'agent',
      }));

    const responses = await Promise.all(promises);

    // Only one should succeed (201), others should fail (400)
    const successful = responses.filter((r) => r.status === 201);
    const failed = responses.filter((r) => r.status === 400);

    expect(successful.length).toBe(1);
    expect(failed.length).toBe(4);

    // Cleanup
    await pool.query('DELETE FROM users WHERE email = $1', [testEmail]);
  }, 30000);

  // Test 5: Mixed read/write operations under load
  it('should handle mixed read/write operations concurrently', async () => {
    const promises = [];

    // Mix of reads
    for (let i = 0; i < 20; i++) {
      promises.push(
        request(app)
          .get('/v1/escrows')
          .set('Authorization', `Bearer ${authToken}`),
      );
    }

    // And writes
    for (let i = 0; i < 5; i++) {
      promises.push(
        request(app)
          .post('/v1/leads')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            firstName: 'Mixed',
            lastName: `Operation${i}`,
            email: `mixed.${Date.now()}.${i}@example.com`,
            leadSource: 'Website',
            status: 'New',
          }),
      );
    }

    const responses = await Promise.all(promises);

    // Count successes
    const readSuccesses = responses.filter((r) => r.status === 200).length;
    const writeSuccesses = responses.filter((r) => r.status === 201).length;

    expect(readSuccesses).toBeGreaterThanOrEqual(15); // Most reads should succeed
    expect(writeSuccesses).toBeGreaterThanOrEqual(3); // Most writes should succeed

    // Cleanup leads
    const leadIds = responses
      .filter((r) => r.status === 201 && r.body.data)
      .map((r) => r.body.data.id);

    for (const id of leadIds) {
      await pool.query('DELETE FROM leads WHERE id = $1', [id]);
    }
  }, 30000);
});
