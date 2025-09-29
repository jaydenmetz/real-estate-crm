const request = require('supertest');
const app = require('../app');
const { pool } = require('../config/database');
const jwt = require('jsonwebtoken');

// Test data
const testUser = {
  id: 'test-user-1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'admin',
  teamId: 'test-team-1'
};

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET || '279fffb2e462a0f2d8b41137be7452c4746f99f2ff3dd0aeafb22f2e799c1472',
    { expiresIn: '24h' }
  );
};

describe('Escrow Archive/Restore/Delete Functionality', () => {
  let authToken;
  let testEscrowId;

  beforeAll(() => {
    authToken = generateToken(testUser);
  });

  afterAll(async () => {
    // Clean up test data
    if (testEscrowId) {
      await pool.query('DELETE FROM escrows WHERE id = $1', [testEscrowId]);
    }
    await pool.end();
  });

  describe('Archive (Soft Delete) Workflow', () => {
    beforeEach(async () => {
      // Create a test escrow
      const createResponse = await request(app)
        .post('/v1/escrows')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          propertyAddress: '123 Test St',
          city: 'Test City',
          state: 'CA',
          zipCode: '12345',
          escrowStatus: 'Active Under Contract',
          purchasePrice: 500000,
          myCommission: 15000
        });

      testEscrowId = createResponse.body.data.id;
    });

    test('Should archive (soft delete) an escrow', async () => {
      const response = await request(app)
        .put(`/v1/escrows/${testEscrowId}/archive`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Escrow archived successfully',
        data: expect.objectContaining({
          displayId: expect.any(String)
        })
      });

      // Verify escrow is archived in database
      const result = await pool.query(
        'SELECT deleted_at FROM escrows WHERE id = $1',
        [testEscrowId]
      );
      expect(result.rows[0].deleted_at).not.toBeNull();
    });

    test('Should not show archived escrows by default', async () => {
      // Archive the escrow first
      await request(app)
        .put(`/v1/escrows/${testEscrowId}/archive`)
        .set('Authorization', `Bearer ${authToken}`);

      // Get escrows without archived flag
      const response = await request(app)
        .get('/v1/escrows')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const escrows = response.body.data.escrows || response.body.data;
      const foundEscrow = escrows.find(e => e.id === testEscrowId);
      expect(foundEscrow).toBeUndefined();
    });

    test('Should show archived escrows with includeArchived flag', async () => {
      // Archive the escrow first
      await request(app)
        .put(`/v1/escrows/${testEscrowId}/archive`)
        .set('Authorization', `Bearer ${authToken}`);

      // Get escrows with includeArchived flag
      const response = await request(app)
        .get('/v1/escrows?includeArchived=true')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const escrows = response.body.data.escrows || response.body.data;
      const foundEscrow = escrows.find(e => e.id === testEscrowId);
      expect(foundEscrow).toBeDefined();
      expect(foundEscrow.deleted_at).not.toBeNull();
    });

    test('Should restore an archived escrow', async () => {
      // Archive first
      await request(app)
        .put(`/v1/escrows/${testEscrowId}/archive`)
        .set('Authorization', `Bearer ${authToken}`);

      // Then restore
      const response = await request(app)
        .put(`/v1/escrows/${testEscrowId}/restore`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Escrow restored successfully',
        data: expect.objectContaining({
          displayId: expect.any(String)
        })
      });

      // Verify escrow is restored in database
      const result = await pool.query(
        'SELECT deleted_at FROM escrows WHERE id = $1',
        [testEscrowId]
      );
      expect(result.rows[0].deleted_at).toBeNull();
    });

    test('Should permanently delete an archived escrow', async () => {
      // Archive first
      await request(app)
        .put(`/v1/escrows/${testEscrowId}/archive`)
        .set('Authorization', `Bearer ${authToken}`);

      // Then permanently delete
      const response = await request(app)
        .delete(`/v1/escrows/${testEscrowId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Escrow permanently deleted',
        data: expect.objectContaining({
          deletedId: testEscrowId
        })
      });

      // Verify escrow is permanently deleted
      const result = await pool.query(
        'SELECT id FROM escrows WHERE id = $1',
        [testEscrowId]
      );
      expect(result.rows).toHaveLength(0);
    });

    test('Should not allow permanent delete of non-archived escrow', async () => {
      const response = await request(app)
        .delete(`/v1/escrows/${testEscrowId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.error.code).toBe('NOT_ARCHIVED');
      expect(response.body.error.message).toContain('Only archived escrows can be permanently deleted');
    });
  });

  describe('Batch Delete Operations', () => {
    let escrowIds = [];

    beforeEach(async () => {
      // Create multiple test escrows
      for (let i = 0; i < 3; i++) {
        const response = await request(app)
          .post('/v1/escrows')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            propertyAddress: `${100 + i} Test St`,
            city: 'Test City',
            state: 'CA',
            zipCode: '12345',
            escrowStatus: 'Active Under Contract',
            purchasePrice: 500000 + (i * 10000)
          });
        escrowIds.push(response.body.data.id);
      }

      // Archive all escrows
      for (const id of escrowIds) {
        await request(app)
          .put(`/v1/escrows/${id}/archive`)
          .set('Authorization', `Bearer ${authToken}`);
      }
    });

    afterEach(async () => {
      // Clean up any remaining escrows
      for (const id of escrowIds) {
        await pool.query('DELETE FROM escrows WHERE id = $1', [id]);
      }
      escrowIds = [];
    });

    test('Should batch delete multiple archived escrows', async () => {
      const response = await request(app)
        .post('/v1/escrows/batch-delete')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ ids: escrowIds })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: expect.stringContaining('3 escrows permanently deleted'),
        data: {
          deletedCount: 3,
          deletedIds: expect.arrayContaining(escrowIds)
        }
      });

      // Verify all are deleted
      const result = await pool.query(
        'SELECT id FROM escrows WHERE id = ANY($1::uuid[])',
        [escrowIds]
      );
      expect(result.rows).toHaveLength(0);
    });

    test('Should not batch delete non-archived escrows', async () => {
      // Create a non-archived escrow
      const newEscrow = await request(app)
        .post('/v1/escrows')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          propertyAddress: '999 New St',
          city: 'Test City',
          state: 'CA',
          zipCode: '12345',
          escrowStatus: 'Active Under Contract'
        });

      const mixedIds = [...escrowIds, newEscrow.body.data.id];

      const response = await request(app)
        .post('/v1/escrows/batch-delete')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ ids: mixedIds })
        .expect(400);

      expect(response.body.error.code).toBe('NOT_ALL_ARCHIVED');
      expect(response.body.error.message).toContain('Some escrows not found or not archived');

      // Clean up
      await pool.query('DELETE FROM escrows WHERE id = $1', [newEscrow.body.data.id]);
    });
  });
});