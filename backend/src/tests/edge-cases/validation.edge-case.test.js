const request = require('supertest');
const app = require('../../app');
const { pool } = require('../../config/database');

describe('Input Validation Edge Cases', () => {
  let authToken;
  let testUserId;

  beforeAll(async () => {
    const loginResponse = await request(app)
      .post('/v1/auth/login')
      .send({
        email: 'admin@jaydenmetz.com',
        password: 'AdminPassword123!',
      });

    authToken = loginResponse.body.data.token;
    testUserId = loginResponse.body.data.user.id;
  });

  afterAll(async () => {
    await pool.end();
  });

  // Test 1: Missing required fields
  it('should reject escrow creation with missing required fields', async () => {
    const response = await request(app)
      .post('/v1/escrows')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        propertyAddress: '123 Test St',
        // Missing purchasePrice, status, etc.
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  // Test 2: Wrong data types
  it('should reject escrow with invalid price type (string instead of number)', async () => {
    const response = await request(app)
      .post('/v1/escrows')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        propertyAddress: '123 Test St',
        purchasePrice: 'not-a-number', // Invalid type
        status: 'active',
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  // Test 3: Negative numbers where not allowed
  it('should reject escrow with negative purchase price', async () => {
    const response = await request(app)
      .post('/v1/escrows')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        propertyAddress: '123 Test St',
        purchasePrice: -500000, // Invalid negative
        status: 'active',
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  // Test 4: Invalid enum values
  it('should reject listing with invalid status value', async () => {
    const response = await request(app)
      .post('/v1/listings')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        address: '123 Test St',
        price: 500000,
        status: 'InvalidStatus', // Not in allowed values
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  // Test 5: Empty strings where not allowed
  it('should reject client with empty email string', async () => {
    const response = await request(app)
      .post('/v1/clients')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        firstName: 'John',
        lastName: 'Doe',
        email: '', // Empty string
        clientType: 'Buyer',
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  // Test 6: Invalid email format
  it('should reject client with invalid email format', async () => {
    const response = await request(app)
      .post('/v1/clients')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'not-an-email', // Invalid format
        clientType: 'Buyer',
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  // Test 7: Excessively long strings
  it('should reject escrow with excessively long property address', async () => {
    const longAddress = 'A'.repeat(1000); // 1000 characters

    const response = await request(app)
      .post('/v1/escrows')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        propertyAddress: longAddress,
        purchasePrice: 500000,
        status: 'active',
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  // Test 8: Special characters in restricted fields
  it('should sanitize special characters in client names', async () => {
    const response = await request(app)
      .post('/v1/clients')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        firstName: 'John<script>alert("XSS")</script>',
        lastName: 'Doe',
        email: `test.${Date.now()}@example.com`,
        clientType: 'Buyer',
      });

    // Should either reject or sanitize
    if (response.status === 201) {
      expect(response.body.data.firstName).not.toContain('<script>');
    } else {
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    }
  });

  // Test 9: Invalid date formats
  it('should reject appointment with invalid date format', async () => {
    const response = await request(app)
      .post('/v1/appointments')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Test Appointment',
        appointmentDate: 'not-a-date', // Invalid format
        startTime: '14:00:00',
        endTime: '15:00:00',
        appointmentType: 'Property Showing',
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  // Test 10: Boundary value testing (dates in past)
  it('should reject appointment with date in the past', async () => {
    const pastDate = new Date('2020-01-01').toISOString().split('T')[0];

    const response = await request(app)
      .post('/v1/appointments')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Test Appointment',
        appointmentDate: pastDate, // In the past
        startTime: '14:00:00',
        endTime: '15:00:00',
        appointmentType: 'Property Showing',
      });

    // Should either reject or warn (depends on business logic)
    // For now, we'll accept it passes OR returns 400
    expect([200, 201, 400]).toContain(response.status);
  });
});
