const request = require('supertest');
const express = require('express');
const {
  createListingRules,
  updateListingRules,
  updateStatusRules,
  listingIdRules,
  batchDeleteRules,
} = require('../validators/listings.validators');
const { validate } = require('../../../middleware/validation.middleware');

const createTestApp = (rules) => {
  const app = express();
  app.use(express.json());
  app.post('/test', rules, validate, (req, res) => {
    res.status(200).json({ success: true });
  });
  return app;
};

describe('Listings Validators', () => {
  describe('createListingRules', () => {
    const app = createTestApp(createListingRules());

    test('should pass with valid listing data', async () => {
      const validData = {
        propertyAddress: '456 Oak Avenue',
        listPrice: 750000,
        bedrooms: 3,
        bathrooms: 2,
        squareFeet: 2000,
        listingStatus: 'Active'
      };

      const response = await request(app).post('/test').send(validData);
      expect(response.status).toBe(200);
    });

    test('should fail when propertyAddress is missing', async () => {
      const invalidData = {
        listPrice: 750000
      };

      const response = await request(app).post('/test').send(invalidData);
      expect(response.status).toBe(400);
      expect(response.body.errors.some(e => e.path === 'propertyAddress')).toBe(true);
    });

    test('should fail when listPrice is missing', async () => {
      const invalidData = {
        propertyAddress: '456 Oak Avenue'
      };

      const response = await request(app).post('/test').send(invalidData);
      expect(response.status).toBe(400);
      expect(response.body.errors.some(e => e.path === 'listPrice')).toBe(true);
    });

    test('should fail when listPrice is not numeric', async () => {
      const invalidData = {
        propertyAddress: '456 Oak Avenue',
        listPrice: 'expensive'
      };

      const response = await request(app).post('/test').send(invalidData);
      expect(response.status).toBe(400);
    });

    test('should fail with invalid listingStatus', async () => {
      const invalidData = {
        propertyAddress: '456 Oak Avenue',
        listPrice: 750000,
        listingStatus: 'InvalidStatus'
      };

      const response = await request(app).post('/test').send(invalidData);
      expect(response.status).toBe(400);
    });

    test('should accept all valid listingStatus values', async () => {
      const validStatuses = ['Coming Soon', 'Active', 'Pending', 'Sold', 'Expired', 'Cancelled', 'Withdrawn'];

      for (const status of validStatuses) {
        const response = await request(app).post('/test').send({
          propertyAddress: '456 Oak Avenue',
          listPrice: 750000,
          listingStatus: status
        });
        expect(response.status).toBe(200);
      }
    });

    test('should fail when bedrooms exceeds max', async () => {
      const invalidData = {
        propertyAddress: '456 Oak Avenue',
        listPrice: 750000,
        bedrooms: 25
      };

      const response = await request(app).post('/test').send(invalidData);
      expect(response.status).toBe(400);
    });

    test('should fail when yearBuilt is in future', async () => {
      const invalidData = {
        propertyAddress: '456 Oak Avenue',
        listPrice: 750000,
        yearBuilt: new Date().getFullYear() + 5
      };

      const response = await request(app).post('/test').send(invalidData);
      expect(response.status).toBe(400);
    });

    test('should fail when yearBuilt is too old', async () => {
      const invalidData = {
        propertyAddress: '456 Oak Avenue',
        listPrice: 750000,
        yearBuilt: 1750
      };

      const response = await request(app).post('/test').send(invalidData);
      expect(response.status).toBe(400);
    });
  });

  describe('updateStatusRules', () => {
    const app = createTestApp(updateStatusRules());

    test('should pass with valid status', async () => {
      const response = await request(app).post('/test').send({ status: 'Sold' });
      expect(response.status).toBe(200);
    });

    test('should fail when status is missing', async () => {
      const response = await request(app).post('/test').send({});
      expect(response.status).toBe(400);
    });

    test('should fail with invalid status', async () => {
      const response = await request(app).post('/test').send({ status: 'NotAValidStatus' });
      expect(response.status).toBe(400);
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

    test('should fail when ids is not an array', async () => {
      const response = await request(app).post('/test').send({ ids: 'not-an-array' });
      expect(response.status).toBe(400);
    });
  });
});
