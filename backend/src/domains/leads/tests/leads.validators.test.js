const request = require('supertest');
const express = require('express');
const {
  createLeadRules,
  updateLeadRules,
  updateStatusRules,
  leadIdRules,
  batchDeleteRules,
} = require('../validators/leads.validators');
const { validate } = require('../../../middleware/validation.middleware');

const createTestApp = (rules) => {
  const app = express();
  app.use(express.json());
  app.post('/test', rules, validate, (req, res) => {
    res.status(200).json({ success: true });
  });
  return app;
};

describe('Leads Validators', () => {
  describe('createLeadRules', () => {
    const app = createTestApp(createLeadRules());

    test('should pass with valid lead data', async () => {
      const validData = {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@example.com',
        phone: '555-5678',
        leadStatus: 'New',
        isPrivate: false
      };

      const response = await request(app).post('/test').send(validData);
      expect(response.status).toBe(200);
    });

    test('should fail when firstName is missing', async () => {
      const invalidData = {
        lastName: 'Johnson',
        email: 'sarah.johnson@example.com'
      };

      const response = await request(app).post('/test').send(invalidData);
      expect(response.status).toBe(400);
      expect(response.body.error.details.some(e => e.field === 'firstName')).toBe(true);
    });

    test('should fail when lastName is missing', async () => {
      const invalidData = {
        firstName: 'Sarah',
        email: 'sarah.johnson@example.com'
      };

      const response = await request(app).post('/test').send(invalidData);
      expect(response.status).toBe(400);
      expect(response.body.error.details.some(e => e.field === 'lastName')).toBe(true);
    });

    test('should fail with invalid email format', async () => {
      const invalidData = {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'invalid-email'
      };

      const response = await request(app).post('/test').send(invalidData);
      expect(response.status).toBe(400);
      expect(response.body.error.details.some(e => e.field === 'email')).toBe(true);
    });

    test('should normalize email', async () => {
      const dataWithEmail = {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: '  SARAH.JOHNSON@EXAMPLE.COM  '
      };

      const response = await request(app).post('/test').send(dataWithEmail);
      expect(response.status).toBe(200);
    });

    test('should fail with invalid leadStatus', async () => {
      const invalidData = {
        firstName: 'Sarah',
        lastName: 'Johnson',
        leadStatus: 'InvalidStatus'
      };

      const response = await request(app).post('/test').send(invalidData);
      expect(response.status).toBe(400);
    });

    test('should accept all valid leadStatus values', async () => {
      const validStatuses = ['New', 'Contacted', 'Qualified', 'Converted', 'Lost'];

      for (const status of validStatuses) {
        const response = await request(app).post('/test').send({
          firstName: 'Sarah',
          lastName: 'Johnson',
          leadStatus: status
        });
        expect(response.status).toBe(200);
      }
    });

    test('should fail when isPrivate is not boolean', async () => {
      const invalidData = {
        firstName: 'Sarah',
        lastName: 'Johnson',
        isPrivate: 'yes'
      };

      const response = await request(app).post('/test').send(invalidData);
      expect(response.status).toBe(400);
    });

    test('should accept boolean values for isPrivate', async () => {
      const booleanValues = [true, false];

      for (const value of booleanValues) {
        const response = await request(app).post('/test').send({
          firstName: 'Sarah',
          lastName: 'Johnson',
          isPrivate: value
        });
        expect(response.status).toBe(200);
      }
    });

    test('should trim whitespace from names', async () => {
      const dataWithWhitespace = {
        firstName: '  Sarah  ',
        lastName: '  Johnson  '
      };

      const response = await request(app).post('/test').send(dataWithWhitespace);
      expect(response.status).toBe(200);
    });

    test('should fail when firstName exceeds max length', async () => {
      const invalidData = {
        firstName: 'a'.repeat(101),
        lastName: 'Johnson'
      };

      const response = await request(app).post('/test').send(invalidData);
      expect(response.status).toBe(400);
    });

    test('should fail when lastName exceeds max length', async () => {
      const invalidData = {
        firstName: 'Sarah',
        lastName: 'a'.repeat(101)
      };

      const response = await request(app).post('/test').send(invalidData);
      expect(response.status).toBe(400);
    });
  });

  describe('updateLeadRules', () => {
    const app = createTestApp(updateLeadRules());

    test('should pass with valid update data', async () => {
      const validData = {
        firstName: 'Sara',
        email: 'sara.johnson@example.com',
        leadStatus: 'Contacted'
      };

      const response = await request(app).post('/test').send(validData);
      expect(response.status).toBe(200);
    });

    test('should pass with empty body (all fields optional)', async () => {
      const response = await request(app).post('/test').send({});
      expect(response.status).toBe(200);
    });

    test('should fail with invalid leadStatus', async () => {
      const invalidData = {
        leadStatus: 'NotValid'
      };

      const response = await request(app).post('/test').send(invalidData);
      expect(response.status).toBe(400);
    });
  });

  describe('updateStatusRules', () => {
    const app = createTestApp(updateStatusRules());

    test('should pass with valid status', async () => {
      const response = await request(app).post('/test').send({ status: 'Qualified' });
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
      const validStatuses = ['New', 'Contacted', 'Qualified', 'Converted', 'Lost'];

      for (const status of validStatuses) {
        const response = await request(app).post('/test').send({ status });
        expect(response.status).toBe(200);
      }
    });
  });

  describe('batchDeleteRules', () => {
    const app = createTestApp(batchDeleteRules());

    test('should pass with valid array of IDs', async () => {
      const response = await request(app).post('/test').send({ ids: ['id1', 'id2', 'id3'] });
      expect(response.status).toBe(200);
    });

    test('should fail with empty array', async () => {
      const response = await request(app).post('/test').send({ ids: [] });
      expect(response.status).toBe(400);
    });

    test('should fail when ids is not an array', async () => {
      const response = await request(app).post('/test').send({ ids: 'string' });
      expect(response.status).toBe(400);
    });
  });
});
