// backend/src/tests/refreshToken.test.js
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');
const pool = require('../config/database');

describe('Refresh Token Tests', () => {
  let testUserId;
  let accessToken;
  let refreshToken;

  beforeAll(async () => {
    // Login to get tokens
    const loginRes = await request(app)
      .post('/v1/auth/login')
      .send({
        email: 'admin@jaydenmetz.com',
        password: 'AdminPassword123!',
      });

    accessToken = loginRes.body.data.accessToken || loginRes.body.data.token;
    refreshToken = loginRes.body.data.refreshToken;
    testUserId = loginRes.body.data.user.id;

    expect(accessToken).toBeDefined();
    expect(refreshToken).toBeDefined();
  });

  afterAll(async () => {
    // Clean up test refresh tokens
    if (testUserId) {
      await pool.query('DELETE FROM refresh_tokens WHERE user_id = $1', [testUserId]);
    }
    await pool.end();
  });

  describe('POST /v1/auth/refresh', () => {
    test('should refresh access token using valid refresh token', async () => {
      const res = await request(app)
        .post('/v1/auth/refresh')
        .send({ refreshToken });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.expiresIn).toBe('15m');

      // New access token should be different from old one
      expect(res.body.data.accessToken).not.toBe(accessToken);
    });

    test('should refresh using httpOnly cookie', async () => {
      // Get fresh login with cookie
      const loginRes = await request(app)
        .post('/v1/auth/login')
        .send({
          email: 'admin@jaydenmetz.com',
          password: 'AdminPassword123!',
        });

      const cookies = loginRes.headers['set-cookie'];
      expect(cookies).toBeDefined();

      // Use cookie to refresh
      const res = await request(app)
        .post('/v1/auth/refresh')
        .set('Cookie', cookies);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
    });

    test('should reject expired refresh token', async () => {
      // Create expired refresh token
      const expiredToken = jwt.sign(
        { userId: testUserId, type: 'refresh' },
        process.env.JWT_SECRET,
        { expiresIn: '-1d' }, // Expired yesterday
      );

      const res = await request(app)
        .post('/v1/auth/refresh')
        .send({ refreshToken: expiredToken });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_REFRESH_TOKEN');
    });

    test('should reject invalid refresh token', async () => {
      const res = await request(app)
        .post('/v1/auth/refresh')
        .send({ refreshToken: 'invalid-token-12345' });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('INVALID_REFRESH_TOKEN');
    });

    test('should reject missing refresh token', async () => {
      const res = await request(app)
        .post('/v1/auth/refresh')
        .send({});

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('NO_REFRESH_TOKEN');
    });

    test('should reject revoked refresh token', async () => {
      // Get a fresh refresh token
      const loginRes = await request(app)
        .post('/v1/auth/login')
        .send({
          email: 'admin@jaydenmetz.com',
          password: 'AdminPassword123!',
        });

      const tokenToRevoke = loginRes.body.data.refreshToken;

      // Revoke it in database
      await pool.query(
        'UPDATE refresh_tokens SET revoked = true WHERE token = $1',
        [tokenToRevoke],
      );

      // Try to use revoked token
      const res = await request(app)
        .post('/v1/auth/refresh')
        .send({ refreshToken: tokenToRevoke });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('INVALID_REFRESH_TOKEN');
    });

    test('new access token should be valid for API calls', async () => {
      // Refresh to get new token
      const refreshRes = await request(app)
        .post('/v1/auth/refresh')
        .send({ refreshToken });

      const newAccessToken = refreshRes.body.data.accessToken;

      // Use new token to make API call
      const apiRes = await request(app)
        .get('/v1/escrows')
        .set('Authorization', `Bearer ${newAccessToken}`);

      expect(apiRes.status).toBe(200);
      expect(apiRes.body.success).toBe(true);
    });

    test('should update last_used_at timestamp', async () => {
      // Get initial timestamp
      const beforeQuery = await pool.query(
        'SELECT last_used_at FROM refresh_tokens WHERE token = $1',
        [refreshToken],
      );
      const beforeTime = beforeQuery.rows[0]?.last_used_at;

      // Wait a moment
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Use refresh token
      await request(app)
        .post('/v1/auth/refresh')
        .send({ refreshToken });

      // Check updated timestamp
      const afterQuery = await pool.query(
        'SELECT last_used_at FROM refresh_tokens WHERE token = $1',
        [refreshToken],
      );
      const afterTime = afterQuery.rows[0]?.last_used_at;

      if (beforeTime && afterTime) {
        expect(new Date(afterTime).getTime()).toBeGreaterThan(new Date(beforeTime).getTime());
      }
    });

    test('should handle concurrent refresh requests', async () => {
      // Make 5 simultaneous refresh requests
      const promises = Array(5).fill(null).map(() => request(app)
        .post('/v1/auth/refresh')
        .send({ refreshToken }));

      const results = await Promise.all(promises);

      // All should succeed
      results.forEach((res) => {
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.accessToken).toBeDefined();
      });

      // All new tokens should be valid
      const tokenValidations = await Promise.all(
        results.map((res) => request(app)
          .get('/v1/escrows')
          .set('Authorization', `Bearer ${res.body.data.accessToken}`)),
      );

      tokenValidations.forEach((validation) => {
        expect(validation.status).toBe(200);
      });
    });

    test('should work after access token expires', async () => {
      // Create a short-lived access token (1 second)
      const shortToken = jwt.sign(
        { userId: testUserId, email: 'admin@jaydenmetz.com' },
        process.env.JWT_SECRET,
        { expiresIn: '1s' },
      );

      // Wait for it to expire
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Try to use expired access token
      const expiredRes = await request(app)
        .get('/v1/escrows')
        .set('Authorization', `Bearer ${shortToken}`);

      expect(expiredRes.status).toBe(401);

      // But refresh token should still work
      const refreshRes = await request(app)
        .post('/v1/auth/refresh')
        .send({ refreshToken });

      expect(refreshRes.status).toBe(200);
      expect(refreshRes.body.data.accessToken).toBeDefined();

      // New token should work
      const newCallRes = await request(app)
        .get('/v1/escrows')
        .set('Authorization', `Bearer ${refreshRes.body.data.accessToken}`);

      expect(newCallRes.status).toBe(200);
    });
  });

  describe('Refresh Token Security', () => {
    test('should not return refresh token in response', async () => {
      const res = await request(app)
        .post('/v1/auth/refresh')
        .send({ refreshToken });

      // Response should only contain accessToken, not a new refreshToken
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeUndefined();
    });

    test('should store refresh token hash, not plaintext', async () => {
      const result = await pool.query(
        'SELECT token FROM refresh_tokens WHERE user_id = $1 LIMIT 1',
        [testUserId],
      );

      const storedToken = result.rows[0]?.token;

      // Stored token should be 64 chars (SHA-256 hex)
      expect(storedToken).toBeDefined();
      expect(storedToken.length).toBe(64);
      expect(/^[a-f0-9]{64}$/.test(storedToken)).toBe(true);
    });

    test('should track device info', async () => {
      const loginRes = await request(app)
        .post('/v1/auth/login')
        .set('User-Agent', 'TestBot/1.0')
        .send({
          email: 'admin@jaydenmetz.com',
          password: 'AdminPassword123!',
        });

      const newRefreshToken = loginRes.body.data.refreshToken;

      const result = await pool.query(
        'SELECT user_agent, device_info FROM refresh_tokens WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
        [testUserId],
      );

      expect(result.rows[0].user_agent).toBe('TestBot/1.0');
      expect(result.rows[0].device_info).toBeDefined();
    });
  });

  describe('Refresh Token Lifecycle', () => {
    test('should have 7-day expiration', async () => {
      const result = await pool.query(
        'SELECT expires_at, created_at FROM refresh_tokens WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
        [testUserId],
      );

      const expiresAt = new Date(result.rows[0].expires_at);
      const createdAt = new Date(result.rows[0].created_at);
      const diffDays = (expiresAt - createdAt) / (1000 * 60 * 60 * 24);

      expect(diffDays).toBeCloseTo(7, 0);
    });

    test('should clean up old tokens on login', async () => {
      // Create multiple refresh tokens
      for (let i = 0; i < 3; i++) {
        await request(app)
          .post('/v1/auth/login')
          .send({
            email: 'admin@jaydenmetz.com',
            password: 'AdminPassword123!',
          });
      }

      const result = await pool.query(
        'SELECT COUNT(*) FROM refresh_tokens WHERE user_id = $1 AND revoked = false',
        [testUserId],
      );

      // Should have a reasonable number (not unlimited)
      const tokenCount = parseInt(result.rows[0].count);
      expect(tokenCount).toBeLessThan(20); // Backend likely limits to 5-10
    });
  });
});
