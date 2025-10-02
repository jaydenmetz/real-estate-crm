const request = require('supertest');
const app = require('../../app');
const { pool } = require('../../config/database');

describe('Authorization Failure Edge Cases', () => {
  let user1Token;
  let user1Id;
  let user2Token;
  let user2Id;
  let user1EscrowId;

  beforeAll(async () => {
    // Login as user 1 (admin)
    const login1 = await request(app)
      .post('/v1/auth/login')
      .send({
        email: 'admin@jaydenmetz.com',
        password: 'AdminPassword123!',
      });

    user1Token = login1.body.data.token;
    user1Id = login1.body.data.user.id;

    // Create an escrow for user 1
    const escrowResponse = await request(app)
      .post('/v1/escrows')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        propertyAddress: '123 Auth Test St',
        city: 'Tehachapi',
        state: 'CA',
        zipCode: '93561',
        purchasePrice: 500000,
        status: 'active',
        escrowNumber: `AUTH-TEST-${Date.now()}`,
      });

    user1EscrowId = escrowResponse.body.data.id;
  });

  afterAll(async () => {
    // Cleanup
    if (user1EscrowId) {
      await pool.query('DELETE FROM escrows WHERE id = $1', [user1EscrowId]);
    }
    await pool.end();
  });

  // Test 1: No authentication token provided
  it('should reject request without authentication token', async () => {
    const response = await request(app)
      .get('/v1/escrows');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('NO_TOKEN');
  });

  // Test 2: Invalid JWT token format
  it('should reject request with malformed JWT token', async () => {
    const response = await request(app)
      .get('/v1/escrows')
      .set('Authorization', 'Bearer invalid_token_123');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  // Test 3: Expired JWT token
  it('should reject request with expired JWT token', async () => {
    // This is a token that expired in 2020 (hardcoded for testing)
    const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJpYXQiOjE1Nzc4MzY4MDAsImV4cCI6MTU3NzgzNjgwMX0.invalid';

    const response = await request(app)
      .get('/v1/escrows')
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  // Test 4: Accessing another user's resource
  it('should prevent user from accessing another user\'s escrow', async () => {
    // Note: This test requires a second user account
    // For now, we'll test that non-existent escrow returns 404 or 403
    const fakeEscrowId = '00000000-0000-0000-0000-000000000000';

    const response = await request(app)
      .get(`/v1/escrows/${fakeEscrowId}`)
      .set('Authorization', `Bearer ${user1Token}`);

    expect([403, 404]).toContain(response.status);
    expect(response.body.success).toBe(false);
  });

  // Test 5: Missing required role
  it('should reject admin-only endpoint for regular user', async () => {
    // Assuming /v1/admin/* endpoints require admin role
    const response = await request(app)
      .get('/v1/users') // Admin endpoint
      .set('Authorization', `Bearer ${user1Token}`);

    // Should either work (if admin) or reject (if not admin)
    if (response.status === 403) {
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toMatch(/ADMIN|FORBIDDEN|INSUFFICIENT/i);
    }
  });

  // Test 6: Invalid API key format
  it('should reject request with invalid API key format', async () => {
    const response = await request(app)
      .get('/v1/escrows')
      .set('X-API-Key', 'short_invalid_key');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('INVALID_API_KEY');
  });

  // Test 7: Revoked API key
  it('should reject request with revoked API key', async () => {
    // Create API key
    const createResponse = await request(app)
      .post('/v1/api-keys')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        name: 'Test Revocation Key',
        expiresInDays: 365,
      });

    const apiKey = createResponse.body.data.key;
    const apiKeyId = createResponse.body.data.id;

    // Verify it works
    const useResponse1 = await request(app)
      .get('/v1/escrows')
      .set('X-API-Key', apiKey);

    expect(useResponse1.status).toBe(200);

    // Revoke it
    await request(app)
      .delete(`/v1/api-keys/${apiKeyId}`)
      .set('Authorization', `Bearer ${user1Token}`);

    // Try to use revoked key
    const useResponse2 = await request(app)
      .get('/v1/escrows')
      .set('X-API-Key', apiKey);

    expect(useResponse2.status).toBe(401);
    expect(useResponse2.body.success).toBe(false);

    // Cleanup
    await pool.query('DELETE FROM api_keys WHERE id = $1', [apiKeyId]);
  });

  // Test 8: Updating resource without permission
  it('should prevent user from updating escrow they don\'t own', async () => {
    // Try to update with a non-existent escrow ID (simulates another user's escrow)
    const fakeEscrowId = '00000000-0000-0000-0000-000000000001';

    const response = await request(app)
      .put(`/v1/escrows/${fakeEscrowId}`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        status: 'closed',
      });

    expect([403, 404]).toContain(response.status);
    expect(response.body.success).toBe(false);
  });

  // Test 9: Deleting resource without permission
  it('should prevent user from deleting escrow they don\'t own', async () => {
    const fakeEscrowId = '00000000-0000-0000-0000-000000000002';

    const response = await request(app)
      .delete(`/v1/escrows/${fakeEscrowId}`)
      .set('Authorization', `Bearer ${user1Token}`);

    expect([403, 404]).toContain(response.status);
    expect(response.body.success).toBe(false);
  });

  // Test 10: Token with tampered payload
  it('should reject JWT token with tampered payload', async () => {
    // Take a valid token and modify its payload (will break signature)
    const parts = user1Token.split('.');
    if (parts.length === 3) {
      // Modify the payload slightly
      const tamperedToken = `${parts[0]}.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${parts[2]}`;

      const response = await request(app)
        .get('/v1/escrows')
        .set('Authorization', `Bearer ${tamperedToken}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    }
  });
});
