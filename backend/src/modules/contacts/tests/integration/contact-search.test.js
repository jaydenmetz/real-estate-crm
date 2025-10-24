/**
 * Integration Test: Contact Search with Role Filters
 *
 * Tests the Google-style search implementation with role filtering
 */

const request = require('supertest');
const app = require('../../app');
const { pool } = require('../../config/database');

describe('Contact Search Integration Tests', () => {
  let authToken;
  let userId;
  let teamId;
  let contactIds = [];

  beforeAll(async () => {
    const userResult = await pool.query(`
      INSERT INTO users (email, password_hash, first_name, last_name, username, role)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, team_id
    `, ['test-search@test.com', '$2b$10$test', 'Search', 'Tester', 'searchtester', 'agent']);

    userId = userResult.rows[0].id;
    teamId = userResult.rows[0].team_id;

    const jwt = require('jsonwebtoken');
    authToken = jwt.sign(
      { id: userId, email: 'test-search@test.com', team_id: teamId },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    // Get role IDs
    const rolesResult = await pool.query(`
      SELECT id, role_name FROM contact_roles WHERE role_name IN ('client', 'lead_buyer', 'agent')
    `);
    const roles = {};
    rolesResult.rows.forEach(r => { roles[r.role_name] = r.id; });

    // Create test contacts
    const contacts = [
      { first: 'Jayden', last: 'Smith', role: roles.client },
      { first: 'Jay', last: 'Johnson', role: roles.lead_buyer },
      { first: 'Jane', last: 'Jayson', role: roles.agent }
    ];

    for (const c of contacts) {
      const result = await pool.query(`
        INSERT INTO contacts (user_id, team_id, first_name, last_name, full_name)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `, [userId, teamId, c.first, c.last, `${c.first} ${c.last}`]);

      contactIds.push(result.rows[0].id);

      await pool.query(`
        INSERT INTO contact_role_assignments (contact_id, role_id, is_primary)
        VALUES ($1, $2, true)
      `, [result.rows[0].id, c.role]);
    }
  });

  afterAll(async () => {
    for (const id of contactIds) {
      await pool.query('DELETE FROM contacts WHERE id = $1', [id]);
    }
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);
  });

  test('Search by name (partial match) - should return all "Jay*" contacts', async () => {
    const response = await request(app)
      .get('/v1/contacts/search')
      .query({ name: 'jay' })
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.length).toBeGreaterThanOrEqual(3);
  });

  test('Search by role (client) - should return only clients', async () => {
    const response = await request(app)
      .get('/v1/contacts/search')
      .query({ role: 'client', name: 'jay' })
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBeGreaterThanOrEqual(1);

    // All results should have client role
    for (const contact of response.body.data) {
      const rolesCheck = await pool.query(`
        SELECT cr.role_name FROM contact_role_assignments cra
        JOIN contact_roles cr ON cra.role_id = cr.id
        WHERE cra.contact_id = $1 AND cr.role_name = 'client'
      `, [contact.id]);
      expect(rolesCheck.rows.length).toBeGreaterThan(0);
    }
  });

  test('Search with limit - should respect limit parameter', async () => {
    const response = await request(app)
      .get('/v1/contacts/search')
      .query({ name: 'jay', limit: 2 })
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBeLessThanOrEqual(2);
  });

  test('Search by email (partial match)', async () => {
    // First, add email to one contact
    await pool.query(`
      UPDATE contacts SET email = $1 WHERE id = $2
    `, ['jayden.test@example.com', contactIds[0]]);

    const response = await request(app)
      .get('/v1/contacts/search')
      .query({ email: 'jayden.test' })
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    expect(response.body.data.some(c => c.email === 'jayden.test@example.com')).toBe(true);
  });

  test('Search with no results', async () => {
    const response = await request(app)
      .get('/v1/contacts/search')
      .query({ name: 'ThisNameDoesNotExist12345' })
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBe(0);
  });
});

module.exports = {};
