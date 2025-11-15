const request = require('supertest');
const app = require('../../app');
const { pool } = require('../../config/infrastructure/database');

describe('API Keys Integration Tests', () => {
  let authToken;
  let testUserId;
  let testApiKeyId;
  let testApiKeyValue;

  // Setup: Login and get auth token
  beforeAll(async () => {
    const loginResponse = await request(app)
      .post('/v1/auth/login')
      .send({
        email: 'admin@jaydenmetz.com',
        password: 'AdminPassword123!',
      });

    expect(loginResponse.status).toBe(200);
    authToken = loginResponse.body.data.token;
    testUserId = loginResponse.body.data.user.id;
  });

  // Cleanup: Delete test API key
  afterAll(async () => {
    if (testApiKeyId) {
      await pool.query('DELETE FROM api_keys WHERE id = $1', [testApiKeyId]);
    }
    await pool.end();
  });

  // Test 1: Create API key with expiration
  it('should create API key with expiration date', async () => {
    const response = await request(app)
      .post('/v1/api-keys')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Integration Test Key',
        expiresInDays: 365,
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data).toHaveProperty('key');
    expect(response.body.data.name).toBe('Integration Test Key');
    expect(response.body.data.key).toHaveLength(64); // 64-character hex string

    testApiKeyId = response.body.data.id;
    testApiKeyValue = response.body.data.key;
  });

  // Test 2: Authenticate request with API key
  it('should authenticate API request with valid API key', async () => {
    const response = await request(app)
      .get('/v1/escrows')
      .set('X-API-Key', testApiKeyValue);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('escrows');
  });

  // Test 3: Reject invalid API key
  it('should reject request with invalid API key', async () => {
    const response = await request(app)
      .get('/v1/escrows')
      .set('X-API-Key', 'invalid_key_1234567890abcdef');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('INVALID_API_KEY');
  });

  // Test 4: List all API keys for user
  it('should retrieve all API keys for authenticated user', async () => {
    const response = await request(app)
      .get('/v1/api-keys')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);

    // Should include our test key
    const testKey = response.body.data.find((k) => k.id === testApiKeyId);
    expect(testKey).toBeDefined();
    expect(testKey.name).toBe('Integration Test Key');
    expect(testKey.key).toBeUndefined(); // Key value should not be returned in list
  });

  // Test 5: Revoke API key
  it('should revoke API key and reject subsequent requests', async () => {
    // Revoke the key
    const revokeResponse = await request(app)
      .delete(`/v1/api-keys/${testApiKeyId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(revokeResponse.status).toBe(200);
    expect(revokeResponse.body.success).toBe(true);

    // Try to use revoked key
    const useResponse = await request(app)
      .get('/v1/escrows')
      .set('X-API-Key', testApiKeyValue);

    expect(useResponse.status).toBe(401);
    expect(useResponse.body.success).toBe(false);
    expect(useResponse.body.error.code).toBe('INVALID_API_KEY');
  });
});
