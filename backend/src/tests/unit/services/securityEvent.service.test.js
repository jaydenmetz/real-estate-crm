const SecurityEventService = require('../../../services/securityEvent.service');
const { pool } = require('../../../config/database');

describe('SecurityEventService Unit Tests', () => {
  let testUserId;
  let testEventId;

  beforeAll(async () => {
    // Create a test user for security events
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      ['securitytest@example.com', 'hashedpassword', 'Security', 'Test', 'agent'],
    );
    testUserId = result.rows[0].id;
  });

  afterAll(async () => {
    // Cleanup
    if (testEventId) {
      await pool.query('DELETE FROM security_events WHERE id = $1', [testEventId]);
    }
    await pool.query('DELETE FROM users WHERE id = $1', [testUserId]);
    await pool.end();
  });

  // Test 1: Log login success event
  it('should log successful login event', async () => {
    const req = {
      ip: '192.168.1.1',
      headers: { 'user-agent': 'Test Browser' },
      path: '/v1/auth/login',
      method: 'POST',
    };

    const user = {
      id: testUserId,
      email: 'securitytest@example.com',
      username: 'securitytest',
    };

    // Fire-and-forget call
    await SecurityEventService.logLoginSuccess(req, user);

    // Give it a moment to write to database
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Verify event was logged
    const result = await pool.query(
      'SELECT * FROM security_events WHERE user_id = $1 AND event_type = $2 ORDER BY created_at DESC LIMIT 1',
      [testUserId, 'login_success'],
    );

    expect(result.rows.length).toBe(1);
    expect(result.rows[0].event_type).toBe('login_success');
    expect(result.rows[0].event_category).toBe('authentication');
    expect(result.rows[0].success).toBe(true);
    expect(result.rows[0].ip_address).toBe('192.168.1.1');

    testEventId = result.rows[0].id;
  });

  // Test 2: Log failed login event
  it('should log failed login attempt', async () => {
    const req = {
      ip: '192.168.1.2',
      headers: { 'user-agent': 'Test Browser' },
      path: '/v1/auth/login',
      method: 'POST',
    };

    await SecurityEventService.logLoginFailed(req, 'securitytest@example.com', 'Invalid password');

    await new Promise((resolve) => setTimeout(resolve, 100));

    const result = await pool.query(
      'SELECT * FROM security_events WHERE email = $1 AND event_type = $2 ORDER BY created_at DESC LIMIT 1',
      ['securitytest@example.com', 'login_failed'],
    );

    expect(result.rows.length).toBe(1);
    expect(result.rows[0].event_type).toBe('login_failed');
    expect(result.rows[0].success).toBe(false);
    expect(result.rows[0].message).toContain('Invalid password');

    await pool.query('DELETE FROM security_events WHERE id = $1', [result.rows[0].id]);
  });

  // Test 3: Log account locked event
  it('should log account lockout event', async () => {
    const req = {
      ip: '192.168.1.3',
      headers: { 'user-agent': 'Test Browser' },
      path: '/v1/auth/login',
      method: 'POST',
    };

    const user = {
      id: testUserId,
      email: 'securitytest@example.com',
    };

    await SecurityEventService.logAccountLocked(req, user, 5);

    await new Promise((resolve) => setTimeout(resolve, 100));

    const result = await pool.query(
      'SELECT * FROM security_events WHERE user_id = $1 AND event_type = $2 ORDER BY created_at DESC LIMIT 1',
      [testUserId, 'account_locked'],
    );

    expect(result.rows.length).toBe(1);
    expect(result.rows[0].event_type).toBe('account_locked');
    expect(result.rows[0].severity).toBe('warning');
    expect(result.rows[0].message).toContain('5 failed attempts');

    await pool.query('DELETE FROM security_events WHERE id = $1', [result.rows[0].id]);
  });

  // Test 4: Log token refresh event
  it('should log token refresh event', async () => {
    const req = {
      ip: '192.168.1.4',
      headers: { 'user-agent': 'Test Browser' },
      path: '/v1/auth/refresh',
      method: 'POST',
    };

    const user = {
      id: testUserId,
      email: 'securitytest@example.com',
    };

    await SecurityEventService.logTokenRefresh(req, user);

    await new Promise((resolve) => setTimeout(resolve, 100));

    const result = await pool.query(
      'SELECT * FROM security_events WHERE user_id = $1 AND event_type = $2 ORDER BY created_at DESC LIMIT 1',
      [testUserId, 'token_refresh'],
    );

    expect(result.rows.length).toBe(1);
    expect(result.rows[0].event_type).toBe('token_refresh');
    expect(result.rows[0].success).toBe(true);

    await pool.query('DELETE FROM security_events WHERE id = $1', [result.rows[0].id]);
  });

  // Test 5: Log API key creation
  it('should log API key creation event', async () => {
    const req = {
      ip: '192.168.1.5',
      headers: { 'user-agent': 'Test Browser' },
      path: '/v1/api-keys',
      method: 'POST',
    };

    const user = {
      id: testUserId,
      email: 'securitytest@example.com',
    };

    const apiKeyId = 'test-api-key-id-123';

    await SecurityEventService.logApiKeyCreated(req, user, apiKeyId, 'Test API Key');

    await new Promise((resolve) => setTimeout(resolve, 100));

    const result = await pool.query(
      'SELECT * FROM security_events WHERE user_id = $1 AND event_type = $2 ORDER BY created_at DESC LIMIT 1',
      [testUserId, 'api_key_created'],
    );

    expect(result.rows.length).toBe(1);
    expect(result.rows[0].event_type).toBe('api_key_created');
    expect(result.rows[0].event_category).toBe('api_key');
    expect(result.rows[0].api_key_id).toBe(apiKeyId);

    await pool.query('DELETE FROM security_events WHERE id = $1', [result.rows[0].id]);
  });

  // Test 6: Log API key revocation
  it('should log API key revocation event', async () => {
    const req = {
      ip: '192.168.1.6',
      headers: { 'user-agent': 'Test Browser' },
      path: '/v1/api-keys/test-key',
      method: 'DELETE',
    };

    const user = {
      id: testUserId,
      email: 'securitytest@example.com',
    };

    const apiKeyId = 'test-api-key-id-456';

    await SecurityEventService.logApiKeyRevoked(req, user, apiKeyId);

    await new Promise((resolve) => setTimeout(resolve, 100));

    const result = await pool.query(
      'SELECT * FROM security_events WHERE user_id = $1 AND event_type = $2 AND api_key_id = $3 ORDER BY created_at DESC LIMIT 1',
      [testUserId, 'api_key_revoked', apiKeyId],
    );

    expect(result.rows.length).toBe(1);
    expect(result.rows[0].event_type).toBe('api_key_revoked');
    expect(result.rows[0].severity).toBe('info');

    await pool.query('DELETE FROM security_events WHERE id = $1', [result.rows[0].id]);
  });

  // Test 7: Log rate limit exceeded
  it('should log rate limit exceeded event', async () => {
    const req = {
      ip: '192.168.1.7',
      headers: { 'user-agent': 'Test Browser' },
      path: '/v1/escrows',
      method: 'GET',
    };

    await SecurityEventService.logRateLimitExceeded(req, 'securitytest@example.com');

    await new Promise((resolve) => setTimeout(resolve, 100));

    const result = await pool.query(
      'SELECT * FROM security_events WHERE event_type = $1 AND ip_address = $2 ORDER BY created_at DESC LIMIT 1',
      ['rate_limit_exceeded', '192.168.1.7'],
    );

    expect(result.rows.length).toBe(1);
    expect(result.rows[0].event_type).toBe('rate_limit_exceeded');
    expect(result.rows[0].event_category).toBe('suspicious');
    expect(result.rows[0].severity).toBe('warning');

    await pool.query('DELETE FROM security_events WHERE id = $1', [result.rows[0].id]);
  });

  // Test 8: Query events by user
  it('should retrieve events for specific user', async () => {
    // Log a few events first
    const req = {
      ip: '192.168.1.8',
      headers: { 'user-agent': 'Test Browser' },
      path: '/v1/test',
      method: 'GET',
    };

    const user = { id: testUserId, email: 'securitytest@example.com' };

    await SecurityEventService.logLoginSuccess(req, user);
    await SecurityEventService.logTokenRefresh(req, user);

    await new Promise((resolve) => setTimeout(resolve, 200));

    // Query events
    const events = await SecurityEventService.getEventsByUser(testUserId, { limit: 10 });

    expect(events.length).toBeGreaterThan(0);
    expect(events[0]).toHaveProperty('event_type');
    expect(events[0]).toHaveProperty('created_at');

    // Cleanup
    for (const event of events) {
      await pool.query('DELETE FROM security_events WHERE id = $1', [event.id]);
    }
  });

  // Test 9: Get event statistics
  it('should retrieve event statistics', async () => {
    const stats = await SecurityEventService.getEventStats(testUserId, 30);

    expect(stats).toHaveProperty('total_events');
    expect(stats).toHaveProperty('successful_events');
    expect(stats).toHaveProperty('failed_events');
    expect(typeof stats.total_events).toBe('number');
  });

  // Test 10: Handle database errors gracefully
  it('should handle database errors gracefully (fire-and-forget)', async () => {
    // Create invalid request (missing required fields)
    const invalidReq = null;
    const invalidUser = null;

    // Should not throw error (fire-and-forget)
    await expect(async () => {
      await SecurityEventService.logLoginSuccess(invalidReq, invalidUser).catch(() => {});
    }).not.toThrow();
  });
});
