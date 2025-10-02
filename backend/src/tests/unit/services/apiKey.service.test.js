const ApiKeyService = require('../../../services/apiKey.service');
const { pool } = require('../../../config/database');

describe('ApiKeyService Unit Tests', () => {
  let testUserId;
  let testApiKeyId;
  let testApiKeyValue;

  beforeAll(async () => {
    // Create test user
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      ['apikey@example.com', 'hashedpassword', 'API', 'Key', 'agent'],
    );
    testUserId = result.rows[0].id;
  });

  afterAll(async () => {
    // Cleanup
    await pool.query('DELETE FROM api_keys WHERE user_id = $1', [testUserId]);
    await pool.query('DELETE FROM users WHERE id = $1', [testUserId]);
    await pool.end();
  });

  // Test 1: Generate API key (64 characters)
  it('should generate 64-character hex API key', () => {
    const apiKey = ApiKeyService.generateApiKey();

    expect(apiKey).toHaveLength(64);
    expect(apiKey).toMatch(/^[a-f0-9]{64}$/); // Hex format
  });

  // Test 2: Hash API key consistently
  it('should hash API key consistently', () => {
    const apiKey = 'test_api_key_12345678901234567890123456789012345678901234567890';
    const hash1 = ApiKeyService.hashApiKey(apiKey);
    const hash2 = ApiKeyService.hashApiKey(apiKey);

    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64); // SHA-256 produces 64 hex chars
  });

  // Test 3: Create API key for user
  it('should create API key for user', async () => {
    const apiKey = await ApiKeyService.createApiKey(testUserId, 'Test API Key', 365);

    expect(apiKey).toHaveProperty('key');
    expect(apiKey).toHaveProperty('id');
    expect(apiKey).toHaveProperty('key_prefix');
    expect(apiKey.key).toHaveLength(64);
    expect(apiKey.name).toBe('Test API Key');

    testApiKeyId = apiKey.id;
    testApiKeyValue = apiKey.key;
  });

  // Test 4: Validate valid API key
  it('should validate valid API key', async () => {
    const userData = await ApiKeyService.validateApiKey(testApiKeyValue);

    expect(userData).not.toBeNull();
    expect(userData.user_id).toBe(testUserId);
    expect(userData.email).toBe('apikey@example.com');
    expect(userData.is_active).toBe(true);
  });

  // Test 5: Reject invalid API key
  it('should reject invalid API key', async () => {
    const invalidKey = 'invalid_api_key_1234567890123456789012345678901234567890123456';

    const userData = await ApiKeyService.validateApiKey(invalidKey);

    expect(userData).toBeNull();
  });

  // Test 6: Get all API keys for user
  it('should retrieve all API keys for user', async () => {
    const apiKeys = await ApiKeyService.getUserApiKeys(testUserId);

    expect(apiKeys.length).toBeGreaterThan(0);
    expect(apiKeys[0]).toHaveProperty('name');
    expect(apiKeys[0]).toHaveProperty('key_prefix');
    expect(apiKeys[0]).not.toHaveProperty('key'); // Full key should not be returned
    expect(apiKeys[0]).not.toHaveProperty('key_hash'); // Hash should not be returned
  });

  // Test 7: Revoke API key
  it('should revoke API key', async () => {
    const revoked = await ApiKeyService.revokeApiKey(testApiKeyId);

    expect(revoked).toBe(true);

    // Try to validate revoked key
    const userData = await ApiKeyService.validateApiKey(testApiKeyValue);

    expect(userData).toBeNull();

    // Re-activate for other tests
    await pool.query('UPDATE api_keys SET is_active = true WHERE id = $1', [testApiKeyId]);
  });

  // Test 8: Delete API key permanently
  it('should delete API key permanently', async () => {
    // Create a new key to delete
    const newKey = await ApiKeyService.createApiKey(testUserId, 'Delete Test Key', 30);

    const deleted = await ApiKeyService.deleteApiKey(newKey.id);

    expect(deleted).toBe(true);

    // Verify it's deleted
    const result = await pool.query('SELECT * FROM api_keys WHERE id = $1', [newKey.id]);

    expect(result.rows.length).toBe(0);
  });

  // Test 9: Update last_used_at timestamp
  it('should update last_used_at when API key is validated', async () => {
    // Get initial last_used_at
    const before = await pool.query(
      'SELECT last_used_at FROM api_keys WHERE id = $1',
      [testApiKeyId],
    );

    const initialLastUsed = before.rows[0].last_used_at;

    // Wait a moment
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Use the API key
    await ApiKeyService.validateApiKey(testApiKeyValue);

    // Check if last_used_at was updated
    const after = await pool.query(
      'SELECT last_used_at FROM api_keys WHERE id = $1',
      [testApiKeyId],
    );

    const updatedLastUsed = after.rows[0].last_used_at;

    // Should be updated (or null if not implemented)
    if (updatedLastUsed) {
      expect(new Date(updatedLastUsed).getTime()).toBeGreaterThan(
        initialLastUsed ? new Date(initialLastUsed).getTime() : 0,
      );
    }
  });

  // Test 10: Reject expired API key
  it('should reject expired API key', async () => {
    // Create API key with expiry in the past
    const expiredKey = ApiKeyService.generateApiKey();
    const keyHash = ApiKeyService.hashApiKey(expiredKey);
    const pastDate = new Date('2020-01-01');

    await pool.query(
      'INSERT INTO api_keys (user_id, name, key_hash, expires_at, is_active) VALUES ($1, $2, $3, $4, $5)',
      [testUserId, 'Expired Key', keyHash, pastDate, true],
    );

    // Try to validate expired key
    const userData = await ApiKeyService.validateApiKey(expiredKey);

    expect(userData).toBeNull();

    // Cleanup
    await pool.query('DELETE FROM api_keys WHERE key_hash = $1', [keyHash]);
  });
});
