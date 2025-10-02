const request = require('supertest');
const app = require('../../app');
const { pool } = require('../../config/database');

describe('Appointments API Integration Tests', () => {
  let authToken;
  let testUserId;
  let testAppointmentId;

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
    if (testAppointmentId) {
      await pool.query('DELETE FROM appointments WHERE id = $1', [testAppointmentId]);
    }
    await pool.end();
  });

  // Test 1: Create appointment with date and time
  it('should create appointment with complete details', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const response = await request(app)
      .post('/v1/appointments')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Property Showing - Integration Test',
        appointmentDate: tomorrow.toISOString().split('T')[0],
        startTime: '14:00:00',
        endTime: '15:00:00',
        location: '123 Test Property Ave',
        appointmentType: 'Property Showing',
        status: 'Scheduled'
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data.title).toBe('Property Showing - Integration Test');

    testAppointmentId = response.body.data.id;
  });

  // Test 2: Get all appointments with date range filter
  it('should retrieve appointments within date range', async () => {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const response = await request(app)
      .get(`/v1/appointments?startDate=${today.toISOString().split('T')[0]}&endDate=${nextWeek.toISOString().split('T')[0]}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('appointments');
    expect(Array.isArray(response.body.data.appointments)).toBe(true);
  });

  // Test 3: Get single appointment by ID
  it('should retrieve single appointment details', async () => {
    const response = await request(app)
      .get(`/v1/appointments/${testAppointmentId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe(testAppointmentId);
    expect(response.body.data.appointmentType).toBe('Property Showing');
  });

  // Test 4: Update appointment time
  it('should update appointment time', async () => {
    const response = await request(app)
      .put(`/v1/appointments/${testAppointmentId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        startTime: '15:00:00',
        endTime: '16:00:00'
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.startTime).toBe('15:00:00');
  });

  // Test 5: Cancel appointment
  it('should cancel appointment and update status', async () => {
    const response = await request(app)
      .post(`/v1/appointments/${testAppointmentId}/cancel`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('cancelled');
  });

  // Test 6: Mark appointment as complete
  it('should mark appointment as completed', async () => {
    // First reschedule (can't complete cancelled appointment)
    await request(app)
      .put(`/v1/appointments/${testAppointmentId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'Scheduled' });

    // Now mark complete
    const response = await request(app)
      .post(`/v1/appointments/${testAppointmentId}/complete`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('Completed');
  });

  // Test 7: Archive appointment
  it('should archive appointment and exclude from active list', async () => {
    // Archive
    const archiveResponse = await request(app)
      .put(`/v1/appointments/${testAppointmentId}/archive`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(archiveResponse.status).toBe(200);
    expect(archiveResponse.body.success).toBe(true);

    // Verify not in active list
    const listResponse = await request(app)
      .get('/v1/appointments')
      .set('Authorization', `Bearer ${authToken}`);

    const archivedAppointment = listResponse.body.data.appointments.find(a => a.id === testAppointmentId);
    expect(archivedAppointment).toBeUndefined();
  });
});
