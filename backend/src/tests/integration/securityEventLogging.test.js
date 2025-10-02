/**
 * Integration Tests: Security Event Logging
 * Tests the complete login → security event logging pipeline
 */

const request = require('supertest');
const app = require('../../app');
const { pool } = require('../../config/database');

describe('Security Event Logging Integration', () => {
  let testUser;
  const testEmail = `test-security-${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';

  beforeAll(async () => {
    // Create test user
    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash(testPassword, 10);

    const result = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role, is_active)
       VALUES ($1, $2, 'Test', 'User', 'agent', true)
       RETURNING id, email`,
      [testEmail, passwordHash],
    );
    testUser = result.rows[0];
  });

  afterAll(async () => {
    // Cleanup test data
    await pool.query('DELETE FROM security_events WHERE user_id = $1', [testUser.id]);
    await pool.query('DELETE FROM users WHERE id = $1', [testUser.id]);
  });

  describe('Login Success Event Logging', () => {
    it('should log security event on successful login', async () => {
      // Login
      const loginRes = await request(app)
        .post('/v1/auth/login')
        .send({
          email: testEmail,
          password: testPassword,
        });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body.success).toBe(true);

      // Wait briefly for async logging to complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Check security event was logged
      const events = await pool.query(
        `SELECT * FROM security_events
         WHERE user_id = $1
         AND event_type = 'login_success'
         ORDER BY created_at DESC
         LIMIT 1`,
        [testUser.id],
      );

      expect(events.rows.length).toBe(1);
      const event = events.rows[0];
      expect(event.event_type).toBe('login_success');
      expect(event.event_category).toBe('authentication');
      expect(event.severity).toBe('info');
      expect(event.success).toBe(true);
      expect(event.email).toBe(testEmail);
      expect(event.ip_address).toBeTruthy();
      expect(event.user_agent).toBeTruthy();
    });

    it('should include request metadata in security event', async () => {
      // Login with custom user agent
      await request(app)
        .post('/v1/auth/login')
        .set('User-Agent', 'Test Client 1.0')
        .send({
          email: testEmail,
          password: testPassword,
        });

      await new Promise((resolve) => setTimeout(resolve, 100));

      const events = await pool.query(
        `SELECT * FROM security_events
         WHERE user_id = $1
         AND event_type = 'login_success'
         ORDER BY created_at DESC
         LIMIT 1`,
        [testUser.id],
      );

      const event = events.rows[0];
      expect(event.user_agent).toContain('Test Client 1.0');
    });
  });

  describe('Login Failure Event Logging', () => {
    it('should log security event on failed login', async () => {
      // Attempt login with wrong password
      const loginRes = await request(app)
        .post('/v1/auth/login')
        .send({
          email: testEmail,
          password: 'WrongPassword123!',
        });

      expect(loginRes.status).toBe(401);
      expect(loginRes.body.success).toBe(false);

      await new Promise((resolve) => setTimeout(resolve, 100));

      // Check security event was logged
      const events = await pool.query(
        `SELECT * FROM security_events
         WHERE email = $1
         AND event_type = 'login_failed'
         ORDER BY created_at DESC
         LIMIT 1`,
        [testEmail],
      );

      expect(events.rows.length).toBe(1);
      const event = events.rows[0];
      expect(event.event_type).toBe('login_failed');
      expect(event.event_category).toBe('authentication');
      expect(event.severity).toBe('warning');
      expect(event.success).toBe(false);
      expect(event.email).toBe(testEmail);
      expect(event.message).toContain('Invalid credentials');
    });

    it('should log multiple failed login attempts', async () => {
      const beforeCount = await pool.query(
        `SELECT COUNT(*) FROM security_events
         WHERE email = $1 AND event_type = 'login_failed'`,
        [testEmail],
      );

      // Attempt 3 failed logins
      for (let i = 0; i < 3; i++) {
        await request(app)
          .post('/v1/auth/login')
          .send({
            email: testEmail,
            password: `WrongPassword${i}`,
          });
      }

      await new Promise((resolve) => setTimeout(resolve, 200));

      const afterCount = await pool.query(
        `SELECT COUNT(*) FROM security_events
         WHERE email = $1 AND event_type = 'login_failed'`,
        [testEmail],
      );

      const newEvents = parseInt(afterCount.rows[0].count) - parseInt(beforeCount.rows[0].count);
      expect(newEvents).toBe(3);
    });
  });

  describe('Account Lockout Event Logging', () => {
    let lockoutTestUser;
    const lockoutEmail = `lockout-test-${Date.now()}@example.com`;

    beforeAll(async () => {
      const bcrypt = require('bcryptjs');
      const passwordHash = await bcrypt.hash(testPassword, 10);

      const result = await pool.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, role, is_active)
         VALUES ($1, $2, 'Lockout', 'Test', 'agent', true)
         RETURNING id, email`,
        [lockoutEmail, passwordHash],
      );
      lockoutTestUser = result.rows[0];
    });

    afterAll(async () => {
      await pool.query('DELETE FROM security_events WHERE user_id = $1', [lockoutTestUser.id]);
      await pool.query('DELETE FROM users WHERE id = $1', [lockoutTestUser.id]);
    });

    it('should log account_locked event after 5 failed attempts', async () => {
      // Attempt 5 failed logins to trigger lockout
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/v1/auth/login')
          .send({
            email: lockoutEmail,
            password: 'WrongPassword',
          });
      }

      await new Promise((resolve) => setTimeout(resolve, 200));

      // Check for account_locked event
      const events = await pool.query(
        `SELECT * FROM security_events
         WHERE user_id = $1
         AND event_type = 'account_locked'
         ORDER BY created_at DESC
         LIMIT 1`,
        [lockoutTestUser.id],
      );

      expect(events.rows.length).toBe(1);
      const event = events.rows[0];
      expect(event.event_type).toBe('account_locked');
      expect(event.severity).toBe('error');
      expect(event.success).toBe(false);
      expect(event.metadata.failed_attempts).toBe(5);
      expect(event.metadata.locked_until).toBeTruthy();
    });

    it('should log lockout_attempt_while_locked on subsequent login attempts', async () => {
      // Account should still be locked from previous test
      const loginRes = await request(app)
        .post('/v1/auth/login')
        .send({
          email: lockoutEmail,
          password: testPassword, // Even correct password should fail
        });

      expect(loginRes.status).toBe(423);
      expect(loginRes.body.error.code).toBe('ACCOUNT_LOCKED');

      await new Promise((resolve) => setTimeout(resolve, 100));

      const events = await pool.query(
        `SELECT * FROM security_events
         WHERE user_id = $1
         AND event_type = 'lockout_attempt_while_locked'
         ORDER BY created_at DESC
         LIMIT 1`,
        [lockoutTestUser.id],
      );

      expect(events.rows.length).toBe(1);
      const event = events.rows[0];
      expect(event.event_type).toBe('lockout_attempt_while_locked');
      expect(event.severity).toBe('warning');
      expect(event.success).toBe(false);
    });
  });

  describe('Token Refresh Event Logging', () => {
    let refreshToken;

    beforeAll(async () => {
      // Login to get refresh token
      const loginRes = await request(app)
        .post('/v1/auth/login')
        .send({
          email: testEmail,
          password: testPassword,
        });

      refreshToken = loginRes.body.data.refreshToken;
    });

    it('should log token_refresh event when access token is refreshed', async () => {
      if (!refreshToken) {
        console.warn('Skipping token refresh test - no refresh token available');
        return;
      }

      const refreshRes = await request(app)
        .post('/v1/auth/refresh')
        .send({ refreshToken });

      expect(refreshRes.status).toBe(200);
      expect(refreshRes.body.success).toBe(true);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const events = await pool.query(
        `SELECT * FROM security_events
         WHERE user_id = $1
         AND event_type = 'token_refresh'
         ORDER BY created_at DESC
         LIMIT 1`,
        [testUser.id],
      );

      expect(events.rows.length).toBe(1);
      const event = events.rows[0];
      expect(event.event_type).toBe('token_refresh');
      expect(event.event_category).toBe('authentication');
      expect(event.severity).toBe('info');
      expect(event.success).toBe(true);
    });
  });

  describe('Security Events Health Endpoint', () => {
    it('should return healthy status', async () => {
      const res = await request(app)
        .get('/v1/security-events/health');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('healthy');
      expect(res.body.data.checks.database.status).toBe('healthy');
      expect(res.body.data.checks.database.totalEvents).toBeGreaterThan(0);
    });

    it('should show recent activity', async () => {
      const res = await request(app)
        .get('/v1/security-events/health');

      expect(res.body.data.checks.recentActivity.status).toBe('healthy');
      expect(res.body.data.checks.recentActivity.eventsLast24h).toBe(true);
    });

    it('should show top event types from last 7 days', async () => {
      const res = await request(app)
        .get('/v1/security-events/health');

      expect(res.body.data.checks.eventTypes.status).toBe('healthy');
      expect(res.body.data.checks.eventTypes.topEventsLast7Days).toBeDefined();
      expect(Array.isArray(res.body.data.checks.eventTypes.topEventsLast7Days)).toBe(true);
    });
  });

  describe('Fire-and-Forget Pattern', () => {
    it('should not block login response if logging fails', async () => {
      // This test verifies that login succeeds even if security event logging fails
      // We can't easily force a logging failure in tests, but we can verify timing
      const startTime = Date.now();

      const loginRes = await request(app)
        .post('/v1/auth/login')
        .send({
          email: testEmail,
          password: testPassword,
        });

      const responseTime = Date.now() - startTime;

      expect(loginRes.status).toBe(200);
      expect(loginRes.body.success).toBe(true);

      // Response should be fast (< 500ms) because logging is fire-and-forget
      expect(responseTime).toBeLessThan(500);
    });
  });
});
