const request = require('supertest');
const app = require('../../app');
const { pool } = require('../../config/database');

describe('Escrows API Integration Tests', () => {
  let authToken;
  let testUserId;
  let testEscrowId;

  // Setup: Login and get auth token
  beforeAll(async () => {
    // Login to get JWT token
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
    if (testEscrowId) {
      await pool.query('DELETE FROM escrows WHERE id = $1', [testEscrowId]);
    }
    await pool.end();
  });

  // Test 1: Create escrow with valid authentication
  it('should create escrow with valid JWT authentication', async () => {
    const response = await request(app)
      .post('/v1/escrows')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        propertyAddress: '123 Integration Test St',
        city: 'Tehachapi',
        state: 'CA',
        zipCode: '93561',
        purchasePrice: 500000,
        escrowNumber: `TEST-${Date.now()}`,
        status: 'active',
        openDate: new Date().toISOString(),
        estimatedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data.propertyAddress).toBe('123 Integration Test St');
    expect(response.body.data.purchasePrice).toBe('500000');

    // Save for cleanup
    testEscrowId = response.body.data.id;
  });

  // Test 2: Get all escrows with pagination
  it('should retrieve paginated escrows list', async () => {
    const response = await request(app)
      .get('/v1/escrows?page=1&limit=10')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('escrows');
    expect(response.body.data).toHaveProperty('pagination');
    expect(Array.isArray(response.body.data.escrows)).toBe(true);
    expect(response.body.data.pagination).toHaveProperty('currentPage');
    expect(response.body.data.pagination).toHaveProperty('totalPages');
    expect(response.body.data.pagination).toHaveProperty('totalCount');
  });

  // Test 3: Get single escrow by ID
  it('should retrieve single escrow by ID', async () => {
    const response = await request(app)
      .get(`/v1/escrows/${testEscrowId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe(testEscrowId);
    expect(response.body.data.propertyAddress).toBe('123 Integration Test St');
  });

  // Test 4: Update escrow with version control
  it('should update escrow with optimistic locking', async () => {
    // First get current version
    const getResponse = await request(app)
      .get(`/v1/escrows/${testEscrowId}`)
      .set('Authorization', `Bearer ${authToken}`);

    const currentVersion = getResponse.body.data.version;

    // Update with version check
    const updateResponse = await request(app)
      .put(`/v1/escrows/${testEscrowId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        status: 'pending',
        version: currentVersion
      });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.success).toBe(true);
    expect(updateResponse.body.data.status).toBe('pending');
    expect(updateResponse.body.data.version).toBe(currentVersion + 1);
  });

  // Test 5: Reject update with stale version (version conflict)
  it('should reject update with stale version number', async () => {
    const response = await request(app)
      .put(`/v1/escrows/${testEscrowId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        status: 'closed',
        version: 0 // Stale version
      });

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VERSION_CONFLICT');
  });

  // Test 6: Reject unauthenticated requests
  it('should reject request without authentication token', async () => {
    const response = await request(app)
      .get('/v1/escrows');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('NO_TOKEN');
  });

  // Test 7: Archive and restore escrow (soft delete)
  it('should archive escrow (soft delete) and exclude from default list', async () => {
    // Archive
    const archiveResponse = await request(app)
      .put(`/v1/escrows/${testEscrowId}/archive`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(archiveResponse.status).toBe(200);
    expect(archiveResponse.body.success).toBe(true);
    expect(archiveResponse.body.data.deleted_at).toBeTruthy();

    // Verify it doesn't appear in default list
    const listResponse = await request(app)
      .get('/v1/escrows')
      .set('Authorization', `Bearer ${authToken}`);

    const archivedEscrow = listResponse.body.data.escrows.find(e => e.id === testEscrowId);
    expect(archivedEscrow).toBeUndefined();
  });
});
