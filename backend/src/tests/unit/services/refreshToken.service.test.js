const RefreshTokenService = require('../../../services/refreshToken.service');
const { pool } = require('../../../config/database');

describe('RefreshTokenService Unit Tests', () => {
  let testUserId;
  let testToken;

  beforeAll(async () => {
    // Create test user
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      ['refreshtoken@example.com', 'hashedpassword', 'Refresh', 'Token', 'agent']
    );
    testUserId = result.rows[0].id;
  });

  afterAll(async () => {
    // Cleanup
    await pool.query('DELETE FROM refresh_tokens WHERE user_id = $1', [testUserId]);
    await pool.query('DELETE FROM users WHERE id = $1', [testUserId]);
    await pool.end();
  });

  // Test 1: Create refresh token
  it('should create a new refresh token', async () => {
    const token = await RefreshTokenService.createRefreshToken(
      testUserId,
      '192.168.1.100',
      'Mozilla/5.0 Test Browser',
      { device: 'Desktop' }
    );

    expect(token).toHaveProperty('token');
    expect(token).toHaveProperty('expires_at');
    expect(token.user_id).toBe(testUserId);
    expect(token.token).toHaveLength(80); // 40 bytes = 80 hex chars
    expect(token.ip_address).toBe('192.168.1.100');

    testToken = token.token;
  });

  // Test 2: Validate valid refresh token
  it('should validate a valid refresh token', async () => {
    const userData = await RefreshTokenService.validateRefreshToken(testToken);

    expect(userData).not.toBeNull();
    expect(userData.user_id).toBe(testUserId);
    expect(userData.email).toBe('refreshtoken@example.com');
    expect(userData.is_active).toBe(true);
  });

  // Test 3: Reject invalid refresh token
  it('should reject invalid refresh token', async () => {
    const invalidToken = 'invalid_token_123456789';

    const userData = await RefreshTokenService.validateRefreshToken(invalidToken);

    expect(userData).toBeNull();
  });

  // Test 4: Revoke refresh token (logout)
  it('should revoke refresh token on logout', async () => {
    // Create a new token to revoke
    const newToken = await RefreshTokenService.createRefreshToken(
      testUserId,
      '192.168.1.101',
      'Test Browser'
    );

    // Revoke it
    const revoked = await RefreshTokenService.revokeRefreshToken(newToken.token);

    expect(revoked).toBe(true);

    // Try to validate revoked token
    const userData = await RefreshTokenService.validateRefreshToken(newToken.token);

    expect(userData).toBeNull();
  });

  // Test 5: Revoke all tokens for user
  it('should revoke all refresh tokens for a user', async () => {
    // Create multiple tokens
    await RefreshTokenService.createRefreshToken(testUserId, '192.168.1.102', 'Browser 1');
    await RefreshTokenService.createRefreshToken(testUserId, '192.168.1.103', 'Browser 2');
    await RefreshTokenService.createRefreshToken(testUserId, '192.168.1.104', 'Browser 3');

    // Revoke all
    const count = await RefreshTokenService.revokeAllUserTokens(testUserId);

    expect(count).toBeGreaterThanOrEqual(3);

    // Verify all tokens are revoked
    const result = await pool.query(
      'SELECT * FROM refresh_tokens WHERE user_id = $1 AND revoked_at IS NULL',
      [testUserId]
    );

    expect(result.rows.length).toBe(0);
  });

  // Test 6: Cleanup expired tokens
  it('should cleanup expired refresh tokens', async () => {
    // Create an expired token manually
    const expiredToken = 'expired_token_' + Date.now();
    const pastDate = new Date('2020-01-01');

    await pool.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5)',
      [testUserId, expiredToken, pastDate, '192.168.1.105', 'Test']
    );

    // Cleanup expired tokens
    const deleted = await RefreshTokenService.cleanupExpiredTokens();

    expect(deleted).toBeGreaterThan(0);

    // Verify expired token is deleted
    const result = await pool.query(
      'SELECT * FROM refresh_tokens WHERE token = $1',
      [expiredToken]
    );

    expect(result.rows.length).toBe(0);
  });

  // Test 7: Get active tokens for user
  it('should retrieve all active tokens for user', async () => {
    // Create fresh tokens
    await RefreshTokenService.createRefreshToken(testUserId, '192.168.1.106', 'Device 1');
    await RefreshTokenService.createRefreshToken(testUserId, '192.168.1.107', 'Device 2');

    const tokens = await RefreshTokenService.getUserActiveTokens(testUserId);

    expect(tokens.length).toBeGreaterThanOrEqual(2);
    expect(tokens[0]).toHaveProperty('ip_address');
    expect(tokens[0]).toHaveProperty('user_agent');
    expect(tokens[0]).toHaveProperty('created_at');
  });

  // Test 8: Token rotation on refresh
  it('should rotate refresh token when used', async () => {
    // Create initial token
    const initialToken = await RefreshTokenService.createRefreshToken(
      testUserId,
      '192.168.1.108',
      'Rotation Test'
    );

    // Rotate it
    const newToken = await RefreshTokenService.rotateRefreshToken(
      initialToken.token,
      '192.168.1.108',
      'Rotation Test'
    );

    expect(newToken).toHaveProperty('token');
    expect(newToken.token).not.toBe(initialToken.token);

    // Old token should be revoked
    const oldValidation = await RefreshTokenService.validateRefreshToken(initialToken.token);
    expect(oldValidation).toBeNull();

    // New token should be valid
    const newValidation = await RefreshTokenService.validateRefreshToken(newToken.token);
    expect(newValidation).not.toBeNull();
  });

  // Test 9: Detect token reuse (security)
  it('should detect and prevent refresh token reuse', async () => {
    // Create and revoke a token
    const reuseToken = await RefreshTokenService.createRefreshToken(
      testUserId,
      '192.168.1.109',
      'Reuse Test'
    );

    await RefreshTokenService.revokeRefreshToken(reuseToken.token);

    // Try to use revoked token
    const result = await RefreshTokenService.validateRefreshToken(reuseToken.token);

    expect(result).toBeNull();
  });

  // Test 10: Handle token expiry edge cases
  it('should reject token that expires in the future but is already past expiry', async () => {
    // Create token with very short expiry (1 second)
    const shortToken = 'short_lived_' + Date.now();
    const shortExpiry = new Date();
    shortExpiry.setSeconds(shortExpiry.getSeconds() - 1); // Already expired

    await pool.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5)',
      [testUserId, shortToken, shortExpiry, '192.168.1.110', 'Test']
    );

    // Try to validate expired token
    const result = await RefreshTokenService.validateRefreshToken(shortToken);

    expect(result).toBeNull();

    // Cleanup
    await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [shortToken]);
  });
});
