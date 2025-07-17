const request = require('supertest');
const app = require('../src/app'); // Assuming you have an app.js that exports your Express app
const { pool } = require('../src/config/database');

// Test data
const testEscrow = {
  propertyAddress: '123 Test Street, Test City, CA 90210',
  purchasePrice: 500000,
  earnestMoneyDeposit: 5000,
  downPayment: 100000,
  commissionPercentage: 2.5,
  acceptanceDate: '2025-01-17',
  closingDate: '2025-02-17',
  propertyType: 'Single Family',
  leadSource: 'Zillow',
  buyers: [
    { name: 'John Doe', email: 'john@test.com', phone: '555-0001' }
  ],
  sellers: [
    { name: 'Jane Smith', email: 'jane@test.com', phone: '555-0002' }
  ]
};

describe('Escrows API', () => {
  let authToken;
  let createdEscrowId;

  beforeAll(async () => {
    // Assuming you have an auth endpoint, get a token
    // This is a placeholder - adjust based on your auth implementation
    authToken = 'test-token';
  });

  afterAll(async () => {
    // Clean up test data
    if (createdEscrowId) {
      await pool.query('DELETE FROM escrows WHERE id = $1', [createdEscrowId]);
    }
    await pool.end();
  });

  describe('POST /v1/escrows', () => {
    it('should create a new escrow', async () => {
      const response = await request(app)
        .post('/v1/escrows')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testEscrow)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.property_address).toBe(testEscrow.propertyAddress);
      expect(response.body.data.purchase_price).toBe(testEscrow.purchasePrice);
      
      createdEscrowId = response.body.data.id;
    });

    it('should return validation error for missing required fields', async () => {
      const response = await request(app)
        .post('/v1/escrows')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(422);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /v1/escrows', () => {
    it('should get all escrows with pagination', async () => {
      const response = await request(app)
        .get('/v1/escrows?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('escrows');
      expect(response.body.data).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data.escrows)).toBe(true);
    });

    it('should filter escrows by status', async () => {
      const response = await request(app)
        .get('/v1/escrows?status=Active')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.escrows.forEach(escrow => {
        expect(escrow.escrow_status).toBe('Active');
      });
    });

    it('should filter escrows by price range', async () => {
      const minPrice = 300000;
      const maxPrice = 600000;
      const response = await request(app)
        .get(`/v1/escrows?minPrice=${minPrice}&maxPrice=${maxPrice}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.escrows.forEach(escrow => {
        expect(escrow.purchase_price).toBeGreaterThanOrEqual(minPrice);
        expect(escrow.purchase_price).toBeLessThanOrEqual(maxPrice);
      });
    });
  });

  describe('GET /v1/escrows/:id', () => {
    it('should get a single escrow with all related data', async () => {
      const response = await request(app)
        .get(`/v1/escrows/${createdEscrowId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(createdEscrowId);
      expect(response.body.data).toHaveProperty('buyers');
      expect(response.body.data).toHaveProperty('sellers');
      expect(response.body.data).toHaveProperty('documents');
      expect(response.body.data).toHaveProperty('notes');
    });

    it('should return 404 for non-existent escrow', async () => {
      const response = await request(app)
        .get('/v1/escrows/NON-EXISTENT-ID')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('PUT /v1/escrows/:id', () => {
    it('should update an escrow', async () => {
      const updates = {
        purchasePrice: 550000,
        escrowStatus: 'Pending'
      };

      const response = await request(app)
        .put(`/v1/escrows/${createdEscrowId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.purchase_price).toBe(updates.purchasePrice);
      expect(response.body.data.escrow_status).toBe(updates.escrowStatus);
    });
  });

  describe('POST /v1/escrows/:id/notes', () => {
    it('should add a note to an escrow', async () => {
      const noteData = {
        content: 'This is a test note',
        isPrivate: false
      };

      const response = await request(app)
        .post(`/v1/escrows/${createdEscrowId}/notes`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(noteData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.content).toBe(noteData.content);
      expect(response.body.data.entity_type).toBe('escrow');
      expect(response.body.data.entity_id).toBe(createdEscrowId);
    });
  });

  describe('POST /v1/escrows/:id/documents', () => {
    it('should add a document reference to an escrow', async () => {
      const documentData = {
        fileName: 'purchase-agreement.pdf',
        filePath: '/uploads/escrows/purchase-agreement.pdf',
        fileSize: 1024000,
        mimeType: 'application/pdf',
        documentType: 'Purchase Agreement'
      };

      const response = await request(app)
        .post(`/v1/escrows/${createdEscrowId}/documents`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(documentData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.file_name).toBe(documentData.fileName);
      expect(response.body.data.entity_type).toBe('escrow');
      expect(response.body.data.entity_id).toBe(createdEscrowId);
    });
  });

  describe('GET /v1/escrows/stats/dashboard', () => {
    it('should get dashboard statistics', async () => {
      const response = await request(app)
        .get('/v1/escrows/stats/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('byStatus');
      expect(response.body.data).toHaveProperty('monthly');
      expect(response.body.data).toHaveProperty('upcoming');
      expect(response.body.data).toHaveProperty('commission');
      expect(response.body.data).toHaveProperty('summary');
    });
  });

  describe('DELETE /v1/escrows/:id', () => {
    it('should soft delete an escrow', async () => {
      const response = await request(app)
        .delete(`/v1/escrows/${createdEscrowId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('Escrow deleted successfully');

      // Verify it's soft deleted (still in DB but with deleted_at)
      const result = await pool.query(
        'SELECT deleted_at FROM escrows WHERE id = $1',
        [createdEscrowId]
      );
      expect(result.rows[0].deleted_at).not.toBeNull();
    });
  });
});

// Manual Testing with curl commands
console.log(`
# Manual Testing Commands

# 1. Create an escrow
curl -X POST http://localhost:3000/v1/escrows \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "propertyAddress": "456 Elm Street, Los Angeles, CA 90001",
    "purchasePrice": 750000,
    "earnestMoneyDeposit": 7500,
    "downPayment": 150000,
    "acceptanceDate": "2025-01-17",
    "closingDate": "2025-02-28",
    "buyers": [{"name": "Alice Johnson", "email": "alice@example.com"}],
    "sellers": [{"name": "Bob Williams", "email": "bob@example.com"}]
  }'

# 2. Get all escrows with filters
curl -X GET "http://localhost:3000/v1/escrows?status=Active&minPrice=500000&page=1&limit=10" \\
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. Get a specific escrow
curl -X GET http://localhost:3000/v1/escrows/ESC-2025-123 \\
  -H "Authorization: Bearer YOUR_TOKEN"

# 4. Update an escrow
curl -X PUT http://localhost:3000/v1/escrows/ESC-2025-123 \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "purchasePrice": 760000,
    "escrowStatus": "Pending"
  }'

# 5. Add a note
curl -X POST http://localhost:3000/v1/escrows/ESC-2025-123/notes \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "content": "Buyer requested home warranty",
    "isPrivate": false
  }'

# 6. Get statistics
curl -X GET http://localhost:3000/v1/escrows/stats/dashboard \\
  -H "Authorization: Bearer YOUR_TOKEN"

# 7. Soft delete an escrow
curl -X DELETE http://localhost:3000/v1/escrows/ESC-2025-123 \\
  -H "Authorization: Bearer YOUR_TOKEN"

# Verify database changes with psql:
# psql $DATABASE_URL -c "SELECT id, property_address, escrow_status, deleted_at FROM escrows ORDER BY created_at DESC LIMIT 5;"
# psql $DATABASE_URL -c "SELECT * FROM escrow_buyers WHERE escrow_id = 'ESC-2025-123';"
# psql $DATABASE_URL -c "SELECT * FROM notes WHERE entity_type = 'escrow' AND entity_id = 'ESC-2025-123';"
`);