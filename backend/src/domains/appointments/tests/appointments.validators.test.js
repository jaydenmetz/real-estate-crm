const request = require('supertest');
const express = require('express');
const {
  createAppointmentRules,
  updateAppointmentRules,
  updateStatusRules,
  appointmentIdRules,
  batchDeleteRules,
} = require('../validators/appointments.validators');
const { validate } = require('../../../middleware/validation.middleware');

const createTestApp = (rules) => {
  const app = express();
  app.use(express.json());
  app.post('/test', rules, validate, (req, res) => {
    res.status(200).json({ success: true });
  });
  return app;
};

describe('Appointments Validators', () => {
  describe('createAppointmentRules', () => {
    const app = createTestApp(createAppointmentRules());

    test('should pass with valid appointment data', async () => {
      const validData = {
        title: 'Property Showing',
        appointmentDate: '2025-12-31',
        startTime: '14:30',
        endTime: '15:30',
        appointmentType: 'Property Showing'
      };

      const response = await request(app).post('/test').send(validData);
      expect(response.status).toBe(200);
    });

    test('should fail when title is missing', async () => {
      const invalidData = {
        appointmentDate: '2025-12-31',
        startTime: '14:30'
      };

      const response = await request(app).post('/test').send(invalidData);
      expect(response.status).toBe(400);
      expect(response.body.error.details.some(e => e.field === 'title')).toBe(true);
    });

    test('should fail when appointmentDate is missing', async () => {
      const invalidData = {
        title: 'Property Showing',
        startTime: '14:30'
      };

      const response = await request(app).post('/test').send(invalidData);
      expect(response.status).toBe(400);
      expect(response.body.error.details.some(e => e.field === 'appointmentDate')).toBe(true);
    });

    test('should fail when startTime is missing', async () => {
      const invalidData = {
        title: 'Property Showing',
        appointmentDate: '2025-12-31'
      };

      const response = await request(app).post('/test').send(invalidData);
      expect(response.status).toBe(400);
      expect(response.body.error.details.some(e => e.field === 'startTime')).toBe(true);
    });

    test('should fail with invalid time format', async () => {
      const invalidData = {
        title: 'Property Showing',
        appointmentDate: '2025-12-31',
        startTime: '25:99'
      };

      const response = await request(app).post('/test').send(invalidData);
      expect(response.status).toBe(400);
    });

    test('should accept valid time formats', async () => {
      const validTimes = ['00:00', '09:30', '12:00', '23:59'];

      for (const time of validTimes) {
        const response = await request(app).post('/test').send({
          title: 'Property Showing',
          appointmentDate: '2025-12-31',
          startTime: time
        });
        expect(response.status).toBe(200);
      }
    });

    test('should fail with invalid appointmentType', async () => {
      const invalidData = {
        title: 'Property Showing',
        appointmentDate: '2025-12-31',
        startTime: '14:30',
        appointmentType: 'InvalidType'
      };

      const response = await request(app).post('/test').send(invalidData);
      expect(response.status).toBe(400);
    });

    test('should accept all valid appointmentType values', async () => {
      const validTypes = ['Property Showing', 'Consultation', 'Open House', 'Inspection', 'Meeting', 'Other'];

      for (const type of validTypes) {
        const response = await request(app).post('/test').send({
          title: 'Test',
          appointmentDate: '2025-12-31',
          startTime: '14:30',
          appointmentType: type
        });
        expect(response.status).toBe(200);
      }
    });

    test('should trim whitespace from title', async () => {
      const dataWithWhitespace = {
        title: '  Property Showing  ',
        appointmentDate: '2025-12-31',
        startTime: '14:30'
      };

      const response = await request(app).post('/test').send(dataWithWhitespace);
      expect(response.status).toBe(200);
    });

    test('should fail when title exceeds max length', async () => {
      const invalidData = {
        title: 'a'.repeat(256),
        appointmentDate: '2025-12-31',
        startTime: '14:30'
      };

      const response = await request(app).post('/test').send(invalidData);
      expect(response.status).toBe(400);
    });
  });

  describe('updateStatusRules', () => {
    const app = createTestApp(updateStatusRules());

    test('should pass with valid status', async () => {
      const response = await request(app).post('/test').send({ status: 'Confirmed' });
      expect(response.status).toBe(200);
    });

    test('should fail when status is missing', async () => {
      const response = await request(app).post('/test').send({});
      expect(response.status).toBe(400);
    });

    test('should fail with invalid status', async () => {
      const response = await request(app).post('/test').send({ status: 'InvalidStatus' });
      expect(response.status).toBe(400);
    });

    test('should accept all valid status values', async () => {
      const validStatuses = ['Scheduled', 'Confirmed', 'Completed', 'Cancelled', 'No Show'];

      for (const status of validStatuses) {
        const response = await request(app).post('/test').send({ status });
        expect(response.status).toBe(200);
      }
    });
  });

  describe('batchDeleteRules', () => {
    const app = createTestApp(batchDeleteRules());

    test('should pass with valid array of IDs', async () => {
      const response = await request(app).post('/test').send({ ids: ['id1', 'id2'] });
      expect(response.status).toBe(200);
    });

    test('should fail with empty array', async () => {
      const response = await request(app).post('/test').send({ ids: [] });
      expect(response.status).toBe(400);
    });
  });
});
