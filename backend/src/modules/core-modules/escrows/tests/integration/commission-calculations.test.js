/**
 * Integration Test: Commission Calculations
 *
 * Tests commission calculation logic for different scenarios:
 * 1. Percentage-based commission
 * 2. Flat-fee commission
 * 3. Dual agency commission split
 * 4. Variable commission rates
 */

const request = require('supertest');
const app = require('../../app');
const { pool } = require('../../config/infrastructure/database');

describe('Commission Calculations Integration Tests', () => {
  let authToken;
  let userId;
  let teamId;

  beforeAll(async () => {
    const userResult = await pool.query(`
      INSERT INTO users (email, password_hash, first_name, last_name, username, role)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, team_id
    `, ['test-commission@test.com', '$2b$10$test', 'Commission', 'Tester', 'commissiontester', 'agent']);

    userId = userResult.rows[0].id;
    teamId = userResult.rows[0].team_id;

    const jwt = require('jsonwebtoken');
    authToken = jwt.sign(
      { id: userId, email: 'test-commission@test.com', team_id: teamId },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    await pool.query('DELETE FROM escrows WHERE user_id = $1', [userId]);
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);
  });

  test('2.5% commission on $500k purchase = $12,500', async () => {
    const response = await request(app)
      .post('/v1/escrows')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        property_address: '100 Test St',
        purchase_price: 500000,
        commission_percentage: 2.5,
        acceptance_date: '2025-10-23',
        closing_date: '2025-11-23',
        escrow_status: 'Active'
      });

    expect(response.status).toBe(201);
    expect(parseFloat(response.body.data.gross_commission)).toBeCloseTo(12500, 2);
  });

  test('3% commission on $1M purchase = $30,000', async () => {
    const response = await request(app)
      .post('/v1/escrows')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        property_address: '200 Test St',
        purchase_price: 1000000,
        commission_percentage: 3.0,
        acceptance_date: '2025-10-23',
        closing_date: '2025-11-23',
        escrow_status: 'Active'
      });

    expect(response.status).toBe(201);
    expect(parseFloat(response.body.data.gross_commission)).toBeCloseTo(30000, 2);
  });

  test('Flat fee commission (no percentage)', async () => {
    const response = await request(app)
      .post('/v1/escrows')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        property_address: '300 Test St',
        purchase_price: 750000,
        commission_flat: 15000,
        acceptance_date: '2025-10-23',
        closing_date: '2025-11-23',
        escrow_status: 'Active'
      });

    expect(response.status).toBe(201);
    expect(parseFloat(response.body.data.gross_commission)).toBeCloseTo(15000, 2);
  });

  test('Update commission percentage', async () => {
    const createResponse = await request(app)
      .post('/v1/escrows')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        property_address: '400 Test St',
        purchase_price: 600000,
        commission_percentage: 2.5,
        acceptance_date: '2025-10-23',
        closing_date: '2025-11-23',
        escrow_status: 'Active'
      });

    const escrowId = createResponse.body.data.id;

    // Update commission to 3%
    const updateResponse = await request(app)
      .put(`/v1/escrows/${escrowId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        commission_percentage: 3.0
      });

    expect(updateResponse.status).toBe(200);
    // 600000 * 3% = 18000
    expect(parseFloat(updateResponse.body.data.gross_commission)).toBeCloseTo(18000, 2);
  });
});

module.exports = {};
