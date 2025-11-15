const request = require('supertest');
const app = require('../../app');
const { pool } = require('../../config/infrastructure/database');

describe('Authentication API Integration Tests', () => {
  let testUserId;
  let authToken;
  let refreshToken;

  // Cleanup: Delete test user
  afterAll(async () => {
    if (testUserId) {
      await pool.query('DELETE FROM users WHERE id = $1', [testUserId]);
    }
    await pool.end();
  });

  // Test 1: User registration
  it('should register new user with valid credentials', async () => {
    const response = await request(app)
      .post('/v1/auth/register')
      .send({
        email: `test.user.${Date.now()}@example.com`,
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
        role: 'agent',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('token');
    expect(response.body.data).toHaveProperty('user');
    expect(response.body.data.user).toHaveProperty('id');

    testUserId = response.body.data.user.id;
    authToken = response.body.data.token;
  });

  // Test 2: Reject duplicate email registration
  it('should reject registration with duplicate email', async () => {
    const response = await request(app)
      .post('/v1/auth/register')
      .send({
        email: 'admin@jaydenmetz.com', // Existing email
        password: 'TestPassword123!',
        firstName: 'Duplicate',
        lastName: 'User',
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('EMAIL_EXISTS');
  });

  // Test 3: User login with valid credentials
  it('should login with correct email and password', async () => {
    const response = await request(app)
      .post('/v1/auth/login')
      .send({
        email: 'admin@jaydenmetz.com',
        password: 'AdminPassword123!',
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('token');
    expect(response.body.data).toHaveProperty('refreshToken');
    expect(response.body.data.user.email).toBe('admin@jaydenmetz.com');

    refreshToken = response.body.data.refreshToken;
  });

  // Test 4: Reject login with incorrect password
  it('should reject login with invalid password', async () => {
    const response = await request(app)
      .post('/v1/auth/login')
      .send({
        email: 'admin@jaydenmetz.com',
        password: 'WrongPassword123!',
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  // Test 5: Refresh access token
  it('should refresh access token with valid refresh token', async () => {
    const response = await request(app)
      .post('/v1/auth/refresh')
      .send({
        refreshToken,
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('token');
    expect(response.body.data).toHaveProperty('refreshToken');
  });
});
