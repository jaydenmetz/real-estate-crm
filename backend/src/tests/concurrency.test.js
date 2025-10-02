// backend/src/tests/concurrency.test.js
const request = require('supertest');
const app = require('../app');
const pool = require('../config/database');

describe('Concurrency Tests - Optimistic Locking', () => {
  let authToken;
  let testEscrowId;
  let testClientId;
  let testListingId;
  let testLeadId;
  let testAppointmentId;

  beforeAll(async () => {
    // Login to get auth token
    const loginRes = await request(app)
      .post('/v1/auth/login')
      .send({
        email: 'admin@jaydenmetz.com',
        password: 'AdminPassword123!',
      });

    authToken = loginRes.body.data.token;
  });

  afterAll(async () => {
    // Clean up test data
    if (testEscrowId) {
      await pool.query('DELETE FROM escrows WHERE id = $1', [testEscrowId]);
    }
    if (testClientId) {
      await pool.query('DELETE FROM clients WHERE id = $1', [testClientId]);
      // Also delete associated contact
      const contact = await pool.query('SELECT contact_id FROM clients WHERE id = $1', [testClientId]);
      if (contact.rows[0]) {
        await pool.query('DELETE FROM contacts WHERE id = $1', [contact.rows[0].contact_id]);
      }
    }
    if (testListingId) {
      await pool.query('DELETE FROM listings WHERE id = $1', [testListingId]);
    }
    if (testLeadId) {
      await pool.query('DELETE FROM leads WHERE id = $1', [testLeadId]);
    }
    if (testAppointmentId) {
      await pool.query('DELETE FROM appointments WHERE id = $1', [testAppointmentId]);
    }

    await pool.end();
  });

  describe('Escrow Optimistic Locking', () => {
    beforeEach(async () => {
      // Create test escrow
      const res = await request(app)
        .post('/v1/escrows')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          propertyAddress: '123 Concurrency Test St',
          city: 'Tehachapi',
          state: 'CA',
          zipCode: '93561',
          purchasePrice: 500000,
          escrowStatus: 'Active',
        });

      testEscrowId = res.body.data.id;
    });

    test('should detect concurrent modification', async () => {
      // Get current escrow with version
      const getRes = await request(app)
        .get(`/v1/escrows/${testEscrowId}`)
        .set('Authorization', `Bearer ${authToken}`);

      const currentVersion = getRes.body.data.version;
      expect(currentVersion).toBe(1);

      // User A updates successfully
      const updateA = await request(app)
        .put(`/v1/escrows/${testEscrowId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          purchasePrice: 525000,
          version: currentVersion,
        });

      expect(updateA.status).toBe(200);
      expect(updateA.body.data.version).toBe(2);

      // User B tries to update with stale version
      const updateB = await request(app)
        .put(`/v1/escrows/${testEscrowId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          purchasePrice: 510000,
          version: currentVersion, // Stale version (1)
        });

      expect(updateB.status).toBe(409);
      expect(updateB.body.error.code).toBe('VERSION_CONFLICT');
      expect(updateB.body.error.currentVersion).toBe(2);
      expect(updateB.body.error.attemptedVersion).toBe(1);
    });

    test('should allow update without version (backwards compatible)', async () => {
      // Update without sending version should still work
      const res = await request(app)
        .put(`/v1/escrows/${testEscrowId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          purchasePrice: 505000,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.version).toBe(2); // Version incremented
    });
  });

  describe('Client Optimistic Locking', () => {
    beforeEach(async () => {
      // Create test client
      const res = await request(app)
        .post('/v1/clients')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'Concurrency',
          lastName: 'Test',
          email: `concurrency-${Date.now()}@test.com`,
          phone: '555-0001',
          clientType: 'buyer',
        });

      testClientId = res.body.data.id;
    });

    test('should detect concurrent client modification', async () => {
      // Get current client
      const getRes = await request(app)
        .get(`/v1/clients/${testClientId}`)
        .set('Authorization', `Bearer ${authToken}`);

      const currentVersion = getRes.body.data.version;

      // First update succeeds
      const updateA = await request(app)
        .put(`/v1/clients/${testClientId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          clientType: 'seller',
          version: currentVersion,
        });

      expect(updateA.status).toBe(200);

      // Second update with stale version fails
      const updateB = await request(app)
        .put(`/v1/clients/${testClientId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'inactive',
          version: currentVersion,
        });

      expect(updateB.status).toBe(409);
      expect(updateB.body.error.code).toBe('VERSION_CONFLICT');
    });

    test('should prevent duplicate email on create', async () => {
      const duplicateRes = await request(app)
        .post('/v1/clients')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'Duplicate',
          lastName: 'Email',
          email: 'admin@jaydenmetz.com', // Known existing email
          phone: '555-0002',
          clientType: 'buyer',
        });

      expect(duplicateRes.status).toBe(409);
      expect(duplicateRes.body.error.code).toBe('DUPLICATE_EMAIL');
    });
  });

  describe('Listing Optimistic Locking', () => {
    beforeEach(async () => {
      // Create test listing
      const res = await request(app)
        .post('/v1/listings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          propertyAddress: '456 Concurrency Ave',
          city: 'Tehachapi',
          state: 'CA',
          listPrice: 450000,
          propertyType: 'Single Family',
        });

      testListingId = res.body.data.id;
    });

    test('should detect concurrent listing modification', async () => {
      const getRes = await request(app)
        .get(`/v1/listings/${testListingId}`)
        .set('Authorization', `Bearer ${authToken}`);

      const currentVersion = getRes.body.data.version;

      // Price reduction by user A
      const updateA = await request(app)
        .put(`/v1/listings/${testListingId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          listPrice: 440000,
          version: currentVersion,
        });

      expect(updateA.status).toBe(200);

      // Conflicting update by user B
      const updateB = await request(app)
        .put(`/v1/listings/${testListingId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          listPrice: 445000,
          version: currentVersion,
        });

      expect(updateB.status).toBe(409);
    });
  });

  describe('Lead Optimistic Locking', () => {
    beforeEach(async () => {
      const res = await request(app)
        .post('/v1/leads')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'Lead',
          lastName: 'Concurrency',
          email: `lead-${Date.now()}@test.com`,
          leadSource: 'Website',
        });

      testLeadId = res.body.data.id;
    });

    test('should detect concurrent lead modification', async () => {
      const getRes = await request(app)
        .get(`/v1/leads/${testLeadId}`)
        .set('Authorization', `Bearer ${authToken}`);

      const currentVersion = getRes.body.data.version;

      const updateA = await request(app)
        .put(`/v1/leads/${testLeadId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          lead_score: 75,
          version: currentVersion,
        });

      expect(updateA.status).toBe(200);

      const updateB = await request(app)
        .put(`/v1/leads/${testLeadId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          lead_score: 80,
          version: currentVersion,
        });

      expect(updateB.status).toBe(409);
    });
  });

  describe('Appointment Optimistic Locking', () => {
    beforeEach(async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];

      const res = await request(app)
        .post('/v1/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Concurrency Test Appointment',
          appointment_date: dateStr,
          start_time: '10:00:00',
          end_time: '11:00:00',
          appointment_type: 'meeting',
        });

      testAppointmentId = res.body.data.id;
    });

    test('should detect concurrent appointment modification', async () => {
      const getRes = await request(app)
        .get(`/v1/appointments/${testAppointmentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      const currentVersion = getRes.body.data.version;

      const updateA = await request(app)
        .put(`/v1/appointments/${testAppointmentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          start_time: '10:30:00',
          version: currentVersion,
        });

      expect(updateA.status).toBe(200);

      const updateB = await request(app)
        .put(`/v1/appointments/${testAppointmentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          start_time: '11:00:00',
          version: currentVersion,
        });

      expect(updateB.status).toBe(409);
    });
  });

  describe('Business Rule Validation', () => {
    test('should reject negative escrow purchase price', async () => {
      const res = await request(app)
        .post('/v1/escrows')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          propertyAddress: '789 Invalid St',
          city: 'Tehachapi',
          state: 'CA',
          purchase_price: -100000, // Negative price
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('BUSINESS_RULE_VIOLATION');
    });

    test('should reject closing date before opening date', async () => {
      const res = await request(app)
        .post('/v1/escrows')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          propertyAddress: '789 Date Invalid St',
          city: 'Tehachapi',
          state: 'CA',
          opening_date: '2025-12-01',
          closing_date: '2025-11-01', // Before opening
        });

      expect(res.status).toBe(400);
      expect(res.body.error.violations).toContainEqual(
        expect.objectContaining({
          rule: 'CLOSING_AFTER_OPENING',
        }),
      );
    });

    test('should reject negative listing price', async () => {
      const res = await request(app)
        .post('/v1/listings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          propertyAddress: '999 Negative Price Ln',
          listPrice: -200000,
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('BUSINESS_RULE_VIOLATION');
    });

    test('should reject invalid year built', async () => {
      const res = await request(app)
        .post('/v1/listings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          propertyAddress: '888 Time Travel Dr',
          listPrice: 300000,
          yearBuilt: 1650, // Too old
        });

      expect(res.status).toBe(400);
      expect(res.body.error.violations).toContainEqual(
        expect.objectContaining({
          rule: 'REASONABLE_YEAR_BUILT',
        }),
      );
    });

    test('should reject lead score outside 0-100 range', async () => {
      const res = await request(app)
        .post('/v1/leads')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'Invalid',
          lastName: 'Score',
          lead_score: 150, // Over 100
        });

      expect(res.status).toBe(400);
      expect(res.body.error.violations).toContainEqual(
        expect.objectContaining({
          rule: 'LEAD_SCORE_RANGE',
        }),
      );
    });

    test('should reject appointment end time before start time', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];

      const res = await request(app)
        .post('/v1/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Invalid Time Appointment',
          appointment_date: dateStr,
          start_time: '15:00:00',
          end_time: '14:00:00', // Before start
        });

      expect(res.status).toBe(400);
      expect(res.body.error.violations).toContainEqual(
        expect.objectContaining({
          rule: 'END_AFTER_START',
        }),
      );
    });
  });
});
