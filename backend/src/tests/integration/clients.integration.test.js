const request = require('supertest');
const app = require('../../app');
const { pool } = require('../../config/database');

describe('Clients API Integration Tests', () => {
  let authToken;
  let testUserId;
  let testClientId;

  // Setup: Login and get auth token
  beforeAll(async () => {
    const loginResponse = await request(app)
      .post('/v1/auth/login')
      .send({
        email: 'admin@jaydenmetz.com',
        password: 'AdminPassword123!'
      });

    expect(loginResponse.status).toBe(200);
    authToken = loginResponse.body.data.token;
    testUserId = loginResponse.body.data.user.id;
  });

  // Cleanup: Delete test data
  afterAll(async () => {
    if (testClientId) {
      await pool.query('DELETE FROM clients WHERE id = $1', [testClientId]);
    }
    await pool.end();
  });

  // Test 1: Create client with contact information
  it('should create client with complete contact details', async () => {
    const response = await request(app)
      .post('/v1/clients')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        firstName: 'John',
        lastName: 'ClientTest',
        email: `test.client.${Date.now()}@example.com`,
        phone: '661-555-1234',
        address: '789 Client Test Dr',
        city: 'Tehachapi',
        state: 'CA',
        zipCode: '93561',
        clientType: 'Buyer',
        status: 'Active'
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data.firstName).toBe('John');
    expect(response.body.data.lastName).toBe('ClientTest');

    testClientId = response.body.data.id;
  });

  // Test 2: Get all clients with pagination
  it('should retrieve paginated clients list', async () => {
    const response = await request(app)
      .get('/v1/clients?page=1&limit=10')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('clients');
    expect(response.body.data).toHaveProperty('pagination');
    expect(Array.isArray(response.body.data.clients)).toBe(true);
  });

  // Test 3: Get single client by ID
  it('should retrieve single client with all details', async () => {
    const response = await request(app)
      .get(`/v1/clients/${testClientId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe(testClientId);
    expect(response.body.data.email).toContain('@example.com');
  });

  // Test 4: Update client phone number
  it('should update client contact information', async () => {
    const response = await request(app)
      .put(`/v1/clients/${testClientId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        phone: '661-555-9999'
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.phone).toBe('661-555-9999');
  });

  // Test 5: Search clients by type
  it('should filter clients by type (Buyer/Seller)', async () => {
    const response = await request(app)
      .get('/v1/clients?clientType=Buyer')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    // All returned clients should be Buyers
    response.body.data.clients.forEach(client => {
      expect(client.clientType).toBe('Buyer');
    });
  });

  // Test 6: Reject duplicate email
  it('should reject client creation with duplicate email', async () => {
    // Get existing client email
    const getResponse = await request(app)
      .get(`/v1/clients/${testClientId}`)
      .set('Authorization', `Bearer ${authToken}`);

    const existingEmail = getResponse.body.data.email;

    // Try to create with same email
    const response = await request(app)
      .post('/v1/clients')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        firstName: 'Duplicate',
        lastName: 'Test',
        email: existingEmail, // Duplicate
        clientType: 'Buyer'
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  // Test 7: Archive client and verify soft delete
  it('should archive client (soft delete) and exclude from active list', async () => {
    // Archive
    const archiveResponse = await request(app)
      .put(`/v1/clients/${testClientId}/archive`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(archiveResponse.status).toBe(200);
    expect(archiveResponse.body.success).toBe(true);

    // Verify not in active list
    const listResponse = await request(app)
      .get('/v1/clients')
      .set('Authorization', `Bearer ${authToken}`);

    const archivedClient = listResponse.body.data.clients.find(c => c.id === testClientId);
    expect(archivedClient).toBeUndefined();
  });
});
