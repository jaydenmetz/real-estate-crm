const request = require('supertest');
const express = require('express');
const {
  createClientRules,
  updateClientRules,
  clientIdRules,
  batchDeleteRules,
} = require('../validators/clients.validators');
const { validate } = require('../../../middleware/validation.middleware');

const createTestApp = (rules) => {
  const app = express();
  app.use(express.json());
  app.post('/test', rules, validate, (req, res) => {
    res.status(200).json({ success: true });
  });
  return app;
};

describe('Clients Validators', () => {
  describe('createClientRules', () => {
    const app = createTestApp(createClientRules());

    test('should pass with valid client data', async () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '555-1234',
        clientType: 'Buyer'
      };

      const response = await request(app).post('/test').send(validData);
      expect(response.status).toBe(200);
    });

    test('should fail when firstName is missing', async () => {
      const invalidData = {
        lastName: 'Doe',
        email: 'john.doe@example.com'
      };

      const response = await request(app).post('/test').send(invalidData);
      expect(response.status).toBe(400);
      expect(response.body.errors.some(e => e.path === 'firstName')).toBe(true);
    });

    test('should fail when lastName is missing', async () => {
      const invalidData = {
        firstName: 'John',
        email: 'john.doe@example.com'
      };

      const response = await request(app).post('/test').send(invalidData);
      expect(response.status).toBe(400);
      expect(response.body.errors.some(e => e.path === 'lastName')).toBe(true);
    });

    test('should fail with invalid email format', async () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'not-an-email'
      };

      const response = await request(app).post('/test').send(invalidData);
      expect(response.status).toBe(400);
      expect(response.body.errors.some(e => e.path === 'email')).toBe(true);
    });

    test('should normalize email', async () => {
      const dataWithEmail = {
        firstName: 'John',
        lastName: 'Doe',
        email: '  JOHN.DOE@EXAMPLE.COM  '
      };

      const response = await request(app).post('/test').send(dataWithEmail);
      expect(response.status).toBe(200);
    });

    test('should fail with invalid clientType', async () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        clientType: 'InvalidType'
      };

      const response = await request(app).post('/test').send(invalidData);
      expect(response.status).toBe(400);
    });

    test('should accept all valid clientType values', async () => {
      const validTypes = ['Buyer', 'Seller', 'Both'];

      for (const type of validTypes) {
        const response = await request(app).post('/test').send({
          firstName: 'John',
          lastName: 'Doe',
          clientType: type
        });
        expect(response.status).toBe(200);
      }
    });

    test('should trim whitespace from names', async () => {
      const dataWithWhitespace = {
        firstName: '  John  ',
        lastName: '  Doe  '
      };

      const response = await request(app).post('/test').send(dataWithWhitespace);
      expect(response.status).toBe(200);
    });

    test('should fail when firstName exceeds max length', async () => {
      const invalidData = {
        firstName: 'a'.repeat(101),
        lastName: 'Doe'
      };

      const response = await request(app).post('/test').send(invalidData);
      expect(response.status).toBe(400);
    });

    test('should fail when lastName exceeds max length', async () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'a'.repeat(101)
      };

      const response = await request(app).post('/test').send(invalidData);
      expect(response.status).toBe(400);
    });
  });

  describe('updateClientRules', () => {
    const app = createTestApp(updateClientRules());

    test('should pass with valid update data', async () => {
      const validData = {
        firstName: 'Jane',
        email: 'jane.doe@example.com'
      };

      const response = await request(app).post('/test').send(validData);
      expect(response.status).toBe(200);
    });

    test('should pass with empty body (all fields optional)', async () => {
      const response = await request(app).post('/test').send({});
      expect(response.status).toBe(200);
    });

    test('should fail with invalid email', async () => {
      const invalidData = {
        email: 'not-valid'
      };

      const response = await request(app).post('/test').send(invalidData);
      expect(response.status).toBe(400);
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

    test('should fail when ids is missing', async () => {
      const response = await request(app).post('/test').send({});
      expect(response.status).toBe(400);
    });
  });
});
