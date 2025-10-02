const request = require('supertest');
const app = require('../../app');
const { pool } = require('../../config/database');

describe('Large Payload Handling', () => {
  let authToken;

  beforeAll(async () => {
    const loginResponse = await request(app)
      .post('/v1/auth/login')
      .send({
        email: 'admin@jaydenmetz.com',
        password: 'AdminPassword123!'
      });

    authToken = loginResponse.body.data.token;
  });

  afterAll(async () => {
    await pool.end();
  });

  // Test 1: Very long text field
  it('should handle or reject very long text fields', async () => {
    const veryLongNotes = 'A'.repeat(100000); // 100KB of text

    const response = await request(app)
      .post('/v1/leads')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        firstName: 'Large',
        lastName: 'Payload',
        email: `large.${Date.now()}@example.com`,
        leadSource: 'Website',
        status: 'New',
        notes: veryLongNotes
      });

    // Should either accept (with truncation) or reject
    if (response.status === 201) {
      // If accepted, might be truncated
      expect(response.body.data).toHaveProperty('id');
      await pool.query('DELETE FROM leads WHERE id = $1', [response.body.data.id]);
    } else {
      // Or rejected with 400/413 (Payload Too Large)
      expect([400, 413]).toContain(response.status);
    }
  }, 30000);

  // Test 2: Large number of array items
  it('should handle pagination for large result sets', async () => {
    // Request large page size
    const response = await request(app)
      .get('/v1/escrows?page=1&limit=10000') // Very large limit
      .set('Authorization', `Bearer ${authToken}`);

    if (response.status === 200) {
      // Should enforce maximum limit (e.g., 100 or 1000)
      expect(response.body.data.escrows.length).toBeLessThanOrEqual(1000);
    } else {
      // Or reject with 400
      expect(response.status).toBe(400);
    }
  });

  // Test 3: Deeply nested JSON
  it('should handle or reject deeply nested JSON objects', async () => {
    // Create deeply nested object
    let nested = { value: 'deep' };
    for (let i = 0; i < 100; i++) {
      nested = { child: nested };
    }

    const response = await request(app)
      .post('/v1/clients')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        firstName: 'Nested',
        lastName: 'Test',
        email: `nested.${Date.now()}@example.com`,
        clientType: 'Buyer',
        metadata: nested // Deeply nested
      });

    // Should either flatten/reject or accept
    if (response.status === 201) {
      await pool.query('DELETE FROM clients WHERE id = $1', [response.body.data.id]);
    } else {
      expect([400, 413]).toContain(response.status);
    }
  });

  // Test 4: Multiple large fields simultaneously
  it('should handle request with multiple large text fields', async () => {
    const largeText = 'B'.repeat(10000); // 10KB each

    const response = await request(app)
      .post('/v1/escrows')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        propertyAddress: largeText,
        city: largeText,
        notes: largeText,
        purchasePrice: 500000,
        status: 'active',
        escrowNumber: `LARGE-${Date.now()}`
      });

    if (response.status === 201) {
      await pool.query('DELETE FROM escrows WHERE id = $1', [response.body.data.id]);
    } else {
      expect([400, 413]).toContain(response.status);
    }
  });

  // Test 5: Batch operations (if supported)
  it('should handle or reject very large batch operations', async () => {
    // Try to create many clients in bulk (if endpoint exists)
    const bulkClients = Array(500).fill(null).map((_, i) => ({
      firstName: 'Bulk',
      lastName: `Client${i}`,
      email: `bulk.${Date.now()}.${i}@example.com`,
      clientType: 'Buyer'
    }));

    const response = await request(app)
      .post('/v1/clients/bulk')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ clients: bulkClients });

    // If bulk endpoint doesn't exist, will get 404
    // If it exists, should either accept with limits or reject
    if (response.status === 201 || response.status === 200) {
      // Success - cleanup
      // (Would need to delete all created clients)
    } else {
      // Expected: 400, 404, 413
      expect([400, 404, 413]).toContain(response.status);
    }
  }, 60000); // 60 second timeout
});
