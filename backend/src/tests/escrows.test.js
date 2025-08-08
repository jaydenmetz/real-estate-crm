const request = require('supertest');
const app = require('../app');
const { pool } = require('../config/database');
const jwt = require('jsonwebtoken');

// Test data
const testUsers = {
  jaydenMetz: {
    id: 'user-1',
    email: 'jaydenmetz@example.com',
    firstName: 'Jayden',
    lastName: 'Metz',
    role: 'admin',
    teamId: 'team-1'
  },
  joshRiley: {
    id: 'user-2',
    email: 'joshriley@example.com',
    firstName: 'Josh',
    lastName: 'Riley',
    role: 'agent',
    teamId: 'team-2'
  },
  teamAdmin: {
    id: 'user-3',
    email: 'admin@team.com',
    firstName: 'Team',
    lastName: 'Admin',
    role: 'team_admin',
    teamId: 'team-1'
  }
};

// Generate JWT tokens for test users
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET || '279fffb2e462a0f2d8b41137be7452c4746f99f2ff3dd0aeafb22f2e799c1472',
    { expiresIn: '24h' }
  );
};

describe('Escrow API Endpoints', () => {
  let jaydenToken, joshToken, teamAdminToken;
  let testEscrowId;

  beforeAll(() => {
    // Generate tokens for test users
    jaydenToken = generateToken(testUsers.jaydenMetz);
    joshToken = generateToken(testUsers.joshRiley);
    teamAdminToken = generateToken(testUsers.teamAdmin);
  });

  afterAll(async () => {
    // Clean up database connections
    await pool.end();
  });

  describe('Authentication Tests', () => {
    test('Should reject requests without Bearer token', async () => {
      const response = await request(app)
        .get('/v1/escrows')
        .expect(401);

      expect(response.body).toEqual({
        success: false,
        error: {
          code: 'NO_AUTH_TOKEN',
          message: 'No authentication token provided'
        }
      });
    });

    test('Should reject requests with invalid token', async () => {
      const response = await request(app)
        .get('/v1/escrows')
        .set('Authorization', 'Bearer invalid-token-here')
        .expect(401);

      expect(response.body.error.code).toBe('INVALID_TOKEN');
    });

    test('Should reject requests with expired token', async () => {
      const expiredToken = jwt.sign(
        { id: 'user-1', email: 'test@example.com' },
        process.env.JWT_SECRET || '279fffb2e462a0f2d8b41137be7452c4746f99f2ff3dd0aeafb22f2e799c1472',
        { expiresIn: '-1h' } // Already expired
      );

      const response = await request(app)
        .get('/v1/escrows')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body.error.code).toBe('TOKEN_EXPIRED');
    });
  });

  describe('GET /v1/escrows - List All Escrows', () => {
    test('Should return escrows for authenticated user', async () => {
      const response = await request(app)
        .get('/v1/escrows')
        .set('Authorization', `Bearer ${jaydenToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      
      // Check response structure
      if (response.body.data.length > 0) {
        const escrow = response.body.data[0];
        expect(escrow).toHaveProperty('id');
        expect(escrow).toHaveProperty('escrowNumber');
        expect(escrow).toHaveProperty('propertyAddress');
        expect(escrow).toHaveProperty('escrowStatus');
        expect(escrow).toHaveProperty('purchasePrice');
      }
    });

    test('Should filter escrows by user/team permissions', async () => {
      // Josh should only see his team's escrows
      const response = await request(app)
        .get('/v1/escrows')
        .set('Authorization', `Bearer ${joshToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      // Add assertions for filtered data when implemented
    });

    test('Should support pagination parameters', async () => {
      const response = await request(app)
        .get('/v1/escrows?page=1&limit=5')
        .set('Authorization', `Bearer ${jaydenToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      if (response.body.data.length > 0) {
        expect(response.body.data.length).toBeLessThanOrEqual(5);
      }
    });

    test('Should support filtering by status', async () => {
      const response = await request(app)
        .get('/v1/escrows?status=active')
        .set('Authorization', `Bearer ${jaydenToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.forEach(escrow => {
        expect(escrow.escrowStatus).toBe('active');
      });
    });
  });

  describe('GET /v1/escrows/stats - Dashboard Statistics', () => {
    test('Should return dashboard statistics for authenticated user', async () => {
      const response = await request(app)
        .get('/v1/escrows/stats')
        .set('Authorization', `Bearer ${jaydenToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalEscrows');
      expect(response.body.data).toHaveProperty('activeEscrows');
      expect(response.body.data).toHaveProperty('totalVolume');
      expect(response.body.data).toHaveProperty('totalCommission');
    });

    test('Should return team-filtered stats for team members', async () => {
      const response = await request(app)
        .get('/v1/escrows/stats')
        .set('Authorization', `Bearer ${joshToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      // Stats should be filtered to Josh's data only
    });
  });

  describe('GET /v1/escrows/:id - Get Single Escrow', () => {
    beforeAll(async () => {
      // Get a test escrow ID
      const response = await request(app)
        .get('/v1/escrows')
        .set('Authorization', `Bearer ${jaydenToken}`);
      
      if (response.body.data && response.body.data.length > 0) {
        testEscrowId = response.body.data[0].id;
      }
    });

    test('Should return full escrow details for authorized user', async () => {
      if (!testEscrowId) {
        console.log('No test escrow available, skipping test');
        return;
      }

      const response = await request(app)
        .get(`/v1/escrows/${testEscrowId}`)
        .set('Authorization', `Bearer ${jaydenToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id', testEscrowId);
      expect(response.body.data).toHaveProperty('propertyAddress');
      expect(response.body.data).toHaveProperty('people');
      expect(response.body.data).toHaveProperty('financials');
      expect(response.body.data).toHaveProperty('timeline');
    });

    test('Should deny access to unauthorized users', async () => {
      if (!testEscrowId) {
        console.log('No test escrow available, skipping test');
        return;
      }

      // Josh trying to access Jayden's escrow
      const response = await request(app)
        .get(`/v1/escrows/${testEscrowId}`)
        .set('Authorization', `Bearer ${joshToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });

    test('Should return 404 for non-existent escrow', async () => {
      const response = await request(app)
        .get('/v1/escrows/non-existent-id')
        .set('Authorization', `Bearer ${jaydenToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('GET /v1/escrows/:id/people - Get Escrow People', () => {
    test('Should return people associated with escrow', async () => {
      if (!testEscrowId) return;

      const response = await request(app)
        .get(`/v1/escrows/${testEscrowId}/people`)
        .set('Authorization', `Bearer ${jaydenToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('buyers');
      expect(response.body.data).toHaveProperty('sellers');
      expect(response.body.data).toHaveProperty('agents');
      expect(response.body.data).toHaveProperty('others');
    });
  });

  describe('GET /v1/escrows/:id/timeline - Get Escrow Timeline', () => {
    test('Should return timeline events', async () => {
      if (!testEscrowId) return;

      const response = await request(app)
        .get(`/v1/escrows/${testEscrowId}/timeline`)
        .set('Authorization', `Bearer ${jaydenToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      
      if (response.body.data.length > 0) {
        const event = response.body.data[0];
        expect(event).toHaveProperty('date');
        expect(event).toHaveProperty('title');
        expect(event).toHaveProperty('status');
      }
    });
  });

  describe('GET /v1/escrows/:id/financials - Get Financial Details', () => {
    test('Should return financial information', async () => {
      if (!testEscrowId) return;

      const response = await request(app)
        .get(`/v1/escrows/${testEscrowId}/financials`)
        .set('Authorization', `Bearer ${jaydenToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('purchasePrice');
      expect(response.body.data).toHaveProperty('loanAmount');
      expect(response.body.data).toHaveProperty('downPayment');
      expect(response.body.data).toHaveProperty('earnestMoney');
      expect(response.body.data).toHaveProperty('commissions');
    });

    test('Should restrict financial data for non-authorized users', async () => {
      if (!testEscrowId) return;

      const response = await request(app)
        .get(`/v1/escrows/${testEscrowId}/financials`)
        .set('Authorization', `Bearer ${joshToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /v1/escrows/:id/checklists - Get Checklists', () => {
    test('Should return checklist items', async () => {
      if (!testEscrowId) return;

      const response = await request(app)
        .get(`/v1/escrows/${testEscrowId}/checklists`)
        .set('Authorization', `Bearer ${jaydenToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('loan');
      expect(response.body.data).toHaveProperty('house');
      expect(response.body.data).toHaveProperty('admin');
      expect(response.body.data).toHaveProperty('progress');
    });
  });

  describe('GET /v1/escrows/:id/documents - Get Documents', () => {
    test('Should return document list', async () => {
      if (!testEscrowId) return;

      const response = await request(app)
        .get(`/v1/escrows/${testEscrowId}/documents`)
        .set('Authorization', `Bearer ${jaydenToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /v1/escrows/:id/property-details - Get Property Details', () => {
    test('Should return property information', async () => {
      if (!testEscrowId) return;

      const response = await request(app)
        .get(`/v1/escrows/${testEscrowId}/property-details`)
        .set('Authorization', `Bearer ${jaydenToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('address');
      expect(response.body.data).toHaveProperty('bedrooms');
      expect(response.body.data).toHaveProperty('bathrooms');
      expect(response.body.data).toHaveProperty('squareFeet');
    });
  });

  describe('POST /v1/escrows - Create New Escrow', () => {
    test('Should create new escrow with valid data', async () => {
      const newEscrow = {
        propertyAddress: '123 Test Street',
        city: 'Test City',
        state: 'CA',
        zipCode: '90210',
        purchasePrice: 500000,
        escrowStatus: 'active',
        openDate: new Date().toISOString(),
        scheduledCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };

      const response = await request(app)
        .post('/v1/escrows')
        .set('Authorization', `Bearer ${jaydenToken}`)
        .send(newEscrow)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('displayId');
      expect(response.body.data.propertyAddress).toBe(newEscrow.propertyAddress);
    });

    test('Should validate required fields', async () => {
      const invalidEscrow = {
        // Missing required fields
        city: 'Test City'
      };

      const response = await request(app)
        .post('/v1/escrows')
        .set('Authorization', `Bearer ${jaydenToken}`)
        .send(invalidEscrow)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('PUT /v1/escrows/:id - Update Escrow', () => {
    test('Should update escrow with valid data', async () => {
      if (!testEscrowId) return;

      const updates = {
        escrowStatus: 'pending',
        purchasePrice: 550000
      };

      const response = await request(app)
        .put(`/v1/escrows/${testEscrowId}`)
        .set('Authorization', `Bearer ${jaydenToken}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.escrowStatus).toBe(updates.escrowStatus);
      expect(response.body.data.purchasePrice).toBe(updates.purchasePrice);
    });

    test('Should deny updates from unauthorized users', async () => {
      if (!testEscrowId) return;

      const updates = {
        escrowStatus: 'closed'
      };

      const response = await request(app)
        .put(`/v1/escrows/${testEscrowId}`)
        .set('Authorization', `Bearer ${joshToken}`)
        .send(updates)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /v1/escrows/:id/people - Update People', () => {
    test('Should update people associated with escrow', async () => {
      if (!testEscrowId) return;

      const updates = {
        buyers: [
          { name: 'John Buyer', email: 'john@example.com', phone: '555-0001' }
        ],
        sellers: [
          { name: 'Jane Seller', email: 'jane@example.com', phone: '555-0002' }
        ]
      };

      const response = await request(app)
        .put(`/v1/escrows/${testEscrowId}/people`)
        .set('Authorization', `Bearer ${jaydenToken}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.buyers).toHaveLength(1);
      expect(response.body.data.sellers).toHaveLength(1);
    });
  });

  describe('PUT /v1/escrows/:id/checklists - Update Checklists', () => {
    test('Should update checklist items', async () => {
      if (!testEscrowId) return;

      const updates = {
        loan: {
          preApproval: { checked: true, date: new Date().toISOString() },
          loanApplication: { checked: false }
        },
        house: {
          inspection: { checked: true, date: new Date().toISOString() }
        }
      };

      const response = await request(app)
        .put(`/v1/escrows/${testEscrowId}/checklists`)
        .set('Authorization', `Bearer ${jaydenToken}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.loan.preApproval.checked).toBe(true);
    });
  });

  describe('PUT /v1/escrows/:id/financials - Update Financials', () => {
    test('Should update financial information', async () => {
      if (!testEscrowId) return;

      const updates = {
        purchasePrice: 525000,
        loanAmount: 420000,
        downPayment: 105000,
        earnestMoney: 10000,
        commissions: {
          listingCommission: 2.5,
          buyerCommission: 2.5
        }
      };

      const response = await request(app)
        .put(`/v1/escrows/${testEscrowId}/financials`)
        .set('Authorization', `Bearer ${jaydenToken}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.purchasePrice).toBe(updates.purchasePrice);
      expect(response.body.data.loanAmount).toBe(updates.loanAmount);
    });
  });

  describe('PUT /v1/escrows/:id/timeline - Update Timeline', () => {
    test('Should update timeline dates', async () => {
      if (!testEscrowId) return;

      const updates = {
        openDate: '2025-01-01',
        inspectionDate: '2025-01-10',
        appraisalDate: '2025-01-15',
        loanApprovalDate: '2025-01-20',
        closingDate: '2025-01-31'
      };

      const response = await request(app)
        .put(`/v1/escrows/${testEscrowId}/timeline`)
        .set('Authorization', `Bearer ${jaydenToken}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.openDate).toBe(updates.openDate);
      expect(response.body.data.closingDate).toBe(updates.closingDate);
    });
  });

  describe('DELETE /v1/escrows/:id - Delete Escrow', () => {
    test('Should soft delete escrow', async () => {
      // Create a test escrow to delete
      const newEscrow = await request(app)
        .post('/v1/escrows')
        .set('Authorization', `Bearer ${jaydenToken}`)
        .send({
          propertyAddress: 'Delete Test Property',
          city: 'Test City',
          state: 'CA',
          zipCode: '90210',
          purchasePrice: 300000,
          escrowStatus: 'active'
        });

      const deleteId = newEscrow.body.data.id;

      const response = await request(app)
        .delete(`/v1/escrows/${deleteId}`)
        .set('Authorization', `Bearer ${jaydenToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Escrow deleted successfully');

      // Verify it's soft deleted (marked as deleted, not actually removed)
      const getResponse = await request(app)
        .get(`/v1/escrows/${deleteId}`)
        .set('Authorization', `Bearer ${jaydenToken}`)
        .expect(404);
    });

    test('Should require admin role to delete', async () => {
      if (!testEscrowId) return;

      const response = await request(app)
        .delete(`/v1/escrows/${testEscrowId}`)
        .set('Authorization', `Bearer ${joshToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('Rate Limiting Tests', () => {
    test('Should enforce rate limits', async () => {
      // Make multiple rapid requests
      const requests = [];
      for (let i = 0; i < 105; i++) {
        requests.push(
          request(app)
            .get('/v1/escrows')
            .set('Authorization', `Bearer ${jaydenToken}`)
        );
      }

      const responses = await Promise.all(requests);
      const rateLimited = responses.some(r => r.status === 429);
      
      expect(rateLimited).toBe(true);
    });
  });

  describe('Team Permission Tests', () => {
    test('Team admin should see all team member escrows', async () => {
      const response = await request(app)
        .get('/v1/escrows')
        .set('Authorization', `Bearer ${teamAdminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      // Should include escrows from all team members
    });

    test('Regular team member should only see own escrows', async () => {
      const response = await request(app)
        .get('/v1/escrows')
        .set('Authorization', `Bearer ${joshToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      // Should only include Josh's escrows
    });
  });
});

// Integration test for complete escrow workflow
describe('Escrow Workflow Integration', () => {
  let authToken;
  let escrowId;

  beforeAll(() => {
    authToken = generateToken(testUsers.jaydenMetz);
  });

  test('Complete escrow lifecycle', async () => {
    // 1. Create new escrow
    const createResponse = await request(app)
      .post('/v1/escrows')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        propertyAddress: '456 Integration Test Ave',
        city: 'Test Valley',
        state: 'CA',
        zipCode: '91234',
        purchasePrice: 750000,
        escrowStatus: 'pending'
      })
      .expect(201);

    escrowId = createResponse.body.data.id;

    // 2. Add people
    await request(app)
      .put(`/v1/escrows/${escrowId}/people`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        buyers: [{ name: 'Integration Buyer', email: 'buyer@test.com' }],
        sellers: [{ name: 'Integration Seller', email: 'seller@test.com' }]
      })
      .expect(200);

    // 3. Update financials
    await request(app)
      .put(`/v1/escrows/${escrowId}/financials`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        loanAmount: 600000,
        downPayment: 150000,
        earnestMoney: 15000
      })
      .expect(200);

    // 4. Update timeline
    await request(app)
      .put(`/v1/escrows/${escrowId}/timeline`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        inspectionDate: '2025-02-01',
        appraisalDate: '2025-02-05',
        closingDate: '2025-02-28'
      })
      .expect(200);

    // 5. Update checklists
    await request(app)
      .put(`/v1/escrows/${escrowId}/checklists`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        loan: {
          preApproval: { checked: true },
          loanApplication: { checked: true }
        }
      })
      .expect(200);

    // 6. Change status to active
    await request(app)
      .put(`/v1/escrows/${escrowId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ escrowStatus: 'active' })
      .expect(200);

    // 7. Verify complete escrow data
    const getResponse = await request(app)
      .get(`/v1/escrows/${escrowId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    const escrow = getResponse.body.data;
    expect(escrow.escrowStatus).toBe('active');
    expect(escrow.people.buyers).toHaveLength(1);
    expect(escrow.financials.loanAmount).toBe(600000);
    expect(escrow.timeline.closingDate).toBe('2025-02-28');

    // 8. Clean up - delete the test escrow
    await request(app)
      .delete(`/v1/escrows/${escrowId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
  });
});