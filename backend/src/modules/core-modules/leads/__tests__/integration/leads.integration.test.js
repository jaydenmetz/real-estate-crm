const request = require('supertest');
const app = require('../../app');
const { pool } = require('../../config/infrastructure/database');

describe('Leads API Integration Tests', () => {
  let authToken;
  let testUserId;
  let testLeadId;

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

  // Cleanup: Delete test data
  afterAll(async () => {
    if (testLeadId) {
      await pool.query('DELETE FROM leads WHERE id = $1', [testLeadId]);
    }
    await pool.end();
  });

  // Test 1: Create lead from website inquiry
  it('should create lead with contact information', async () => {
    const response = await request(app)
      .post('/v1/leads')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        firstName: 'Sarah',
        lastName: 'LeadTest',
        email: `lead.test.${Date.now()}@example.com`,
        phone: '661-555-7890',
        leadSource: 'Website',
        status: 'New',
        interestedIn: 'Buying',
        notes: 'Interested in properties under $600k',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data.firstName).toBe('Sarah');
    expect(response.body.data.status).toBe('New');

    testLeadId = response.body.data.id;
  });

  // Test 2: Get all leads with status filter
  it('should retrieve leads by status', async () => {
    const response = await request(app)
      .get('/v1/leads?status=New')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('leads');
    expect(Array.isArray(response.body.data.leads)).toBe(true);

    // All returned leads should be 'New'
    response.body.data.leads.forEach((lead) => {
      expect(lead.status).toBe('New');
    });
  });

  // Test 3: Get single lead by ID
  it('should retrieve single lead details', async () => {
    const response = await request(app)
      .get(`/v1/leads/${testLeadId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe(testLeadId);
    expect(response.body.data.leadSource).toBe('Website');
  });

  // Test 4: Update lead status through pipeline
  it('should update lead status to Contacted', async () => {
    const response = await request(app)
      .put(`/v1/leads/${testLeadId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        status: 'Contacted',
        notes: `Called lead on ${new Date().toLocaleDateString()}`,
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('Contacted');
  });

  // Test 5: Filter leads by source
  it('should filter leads by lead source', async () => {
    const response = await request(app)
      .get('/v1/leads?leadSource=Website')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    // All returned leads should be from Website
    response.body.data.leads.forEach((lead) => {
      expect(lead.leadSource).toBe('Website');
    });
  });

  // Test 6: Convert lead to client
  it('should convert qualified lead to client', async () => {
    // Update to Qualified status first
    await request(app)
      .put(`/v1/leads/${testLeadId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'Qualified' });

    // Convert to client
    const response = await request(app)
      .post(`/v1/leads/${testLeadId}/convert`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        clientType: 'Buyer',
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('clientId');

    // Cleanup created client
    await pool.query('DELETE FROM clients WHERE id = $1', [response.body.data.clientId]);
  });

  // Test 7: Archive lead
  it('should archive lead and exclude from active list', async () => {
    // Archive
    const archiveResponse = await request(app)
      .put(`/v1/leads/${testLeadId}/archive`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(archiveResponse.status).toBe(200);
    expect(archiveResponse.body.success).toBe(true);

    // Verify not in active list
    const listResponse = await request(app)
      .get('/v1/leads')
      .set('Authorization', `Bearer ${authToken}`);

    const archivedLead = listResponse.body.data.leads.find((l) => l.id === testLeadId);
    expect(archivedLead).toBeUndefined();
  });
});
