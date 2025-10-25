const request = require('supertest');
const express = require('express');
const { body, validationResult } = require('express-validator');
const {
  createEscrowRules,
  updateEscrowRules,
  escrowIdRules,
  batchDeleteRules,
} = require('../validators/escrows.validators');
const { validate } = require('../../../middleware/validation.middleware');

// Create a test app for validator testing
const createTestApp = (rules) => {
  const app = express();
  app.use(express.json());

  app.post('/test', rules, validate, (req, res) => {
    res.status(200).json({ success: true });
  });

  return app;
};

describe('Escrows Validators', () => {
  describe('createEscrowRules', () => {
    const app = createTestApp(createEscrowRules());

    test('should pass with valid escrow data', async () => {
      const validData = {
        propertyAddress: '123 Main St',
        purchasePrice: 500000,
        escrowStatus: 'Active',
        closingDate: '2025-12-31'
      };

      const response = await request(app)
        .post('/test')
        .send(validData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should fail when propertyAddress is missing', async () => {
      const invalidData = {
        purchasePrice: 500000
      };

      const response = await request(app)
        .post('/test')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.some(e => e.path === 'propertyAddress')).toBe(true);
    });

    test('should fail when propertyAddress is empty string', async () => {
      const invalidData = {
        propertyAddress: '   ',
        purchasePrice: 500000
      };

      const response = await request(app)
        .post('/test')
        .send(invalidData);

      expect(response.status).toBe(400);
    });

    test('should fail when propertyAddress exceeds max length', async () => {
      const invalidData = {
        propertyAddress: 'a'.repeat(256),
        purchasePrice: 500000
      };

      const response = await request(app)
        .post('/test')
        .send(invalidData);

      expect(response.status).toBe(400);
    });

    test('should fail when purchasePrice is not a number', async () => {
      const invalidData = {
        propertyAddress: '123 Main St',
        purchasePrice: 'not-a-number'
      };

      const response = await request(app)
        .post('/test')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.errors.some(e => e.path === 'purchasePrice')).toBe(true);
    });

    test('should fail when escrowStatus is invalid', async () => {
      const invalidData = {
        propertyAddress: '123 Main St',
        escrowStatus: 'InvalidStatus'
      };

      const response = await request(app)
        .post('/test')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.errors.some(e => e.path === 'escrowStatus')).toBe(true);
    });

    test('should accept all valid escrowStatus values', async () => {
      const validStatuses = ['Active', 'Pending', 'Closed', 'Cancelled'];

      for (const status of validStatuses) {
        const response = await request(app)
          .post('/test')
          .send({
            propertyAddress: '123 Main St',
            escrowStatus: status
          });

        expect(response.status).toBe(200);
      }
    });

    test('should trim whitespace from propertyAddress', async () => {
      const dataWithWhitespace = {
        propertyAddress: '  123 Main St  ',
        purchasePrice: 500000
      };

      const response = await request(app)
        .post('/test')
        .send(dataWithWhitespace);

      expect(response.status).toBe(200);
    });

    test('should convert purchasePrice to float', async () => {
      const dataWithStringPrice = {
        propertyAddress: '123 Main St',
        purchasePrice: '500000.50'
      };

      const response = await request(app)
        .post('/test')
        .send(dataWithStringPrice);

      expect(response.status).toBe(200);
    });
  });

  describe('updateEscrowRules', () => {
    const app = createTestApp(updateEscrowRules());

    test('should pass with valid update data', async () => {
      const validData = {
        propertyAddress: '456 Oak Ave',
        purchasePrice: 750000
      };

      const response = await request(app)
        .post('/test')
        .send(validData);

      expect(response.status).toBe(200);
    });

    test('should pass with empty body (all fields optional)', async () => {
      const response = await request(app)
        .post('/test')
        .send({});

      expect(response.status).toBe(200);
    });

    test('should fail with invalid escrowStatus', async () => {
      const invalidData = {
        escrowStatus: 'NotAValidStatus'
      };

      const response = await request(app)
        .post('/test')
        .send(invalidData);

      expect(response.status).toBe(400);
    });

    test('should fail with propertyAddress exceeding max length', async () => {
      const invalidData = {
        propertyAddress: 'a'.repeat(256)
      };

      const response = await request(app)
        .post('/test')
        .send(invalidData);

      expect(response.status).toBe(400);
    });
  });

  describe('escrowIdRules', () => {
    const createParamTestApp = (rules) => {
      const app = express();
      app.use(express.json());

      app.get('/test/:id', rules, validate, (req, res) => {
        res.status(200).json({ success: true });
      });

      return app;
    };

    const app = createParamTestApp(escrowIdRules());

    test('should pass with valid ID parameter', async () => {
      const response = await request(app)
        .get('/test/123');

      expect(response.status).toBe(200);
    });

    test('should fail with empty ID parameter', async () => {
      const response = await request(app)
        .get('/test/');

      // Express routing will return 404 for missing parameter
      expect(response.status).toBe(404);
    });
  });

  describe('batchDeleteRules', () => {
    const app = createTestApp(batchDeleteRules());

    test('should pass with valid array of IDs', async () => {
      const validData = {
        ids: ['id1', 'id2', 'id3']
      };

      const response = await request(app)
        .post('/test')
        .send(validData);

      expect(response.status).toBe(200);
    });

    test('should fail with empty array', async () => {
      const invalidData = {
        ids: []
      };

      const response = await request(app)
        .post('/test')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.errors.some(e => e.path === 'ids')).toBe(true);
    });

    test('should fail when ids is not an array', async () => {
      const invalidData = {
        ids: 'not-an-array'
      };

      const response = await request(app)
        .post('/test')
        .send(invalidData);

      expect(response.status).toBe(400);
    });

    test('should fail when ids is missing', async () => {
      const response = await request(app)
        .post('/test')
        .send({});

      expect(response.status).toBe(400);
    });
  });
});
