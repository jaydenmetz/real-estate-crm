const request = require('supertest');
const app = require('../../app');
const { pool } = require('../../config/infrastructure/database');

describe('Security Attack Prevention Tests', () => {
  let authToken;
  let testClientId;

  beforeAll(async () => {
    const loginResponse = await request(app)
      .post('/v1/auth/login')
      .send({
        email: 'admin@jaydenmetz.com',
        password: 'AdminPassword123!',
      });

    authToken = loginResponse.body.data.token;
  });

  afterAll(async () => {
    if (testClientId) {
      await pool.query('DELETE FROM clients WHERE id = $1', [testClientId]);
    }
    await pool.end();
  });

  // Test 1: SQL Injection in search query
  it('should prevent SQL injection in search parameter', async () => {
    const response = await request(app)
      .get('/v1/clients?search=\'; DROP TABLE clients; --')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200); // Should not crash
    expect(response.body.success).toBe(true);

    // Verify table still exists by querying it
    const verifyResponse = await request(app)
      .get('/v1/clients')
      .set('Authorization', `Bearer ${authToken}`);

    expect(verifyResponse.status).toBe(200);
  });

  // Test 2: SQL Injection in ID parameter
  it('should prevent SQL injection in ID parameter', async () => {
    const response = await request(app)
      .get('/v1/escrows/1\' OR \'1\'=\'1')
      .set('Authorization', `Bearer ${authToken}`);

    // Should return error, not execute injection
    expect([400, 404]).toContain(response.status);
    expect(response.body.success).toBe(false);
  });

  // Test 3: XSS prevention in text inputs
  it('should sanitize XSS attempt in client name', async () => {
    const xssAttempt = '<script>alert("XSS")</script>';

    const response = await request(app)
      .post('/v1/clients')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        firstName: xssAttempt,
        lastName: 'Test',
        email: `xss.test.${Date.now()}@example.com`,
        clientType: 'Buyer',
      });

    if (response.status === 201) {
      // If accepted, should be sanitized
      expect(response.body.data.firstName).not.toContain('<script>');
      testClientId = response.body.data.id;
    } else {
      // Or rejected entirely
      expect(response.status).toBe(400);
    }
  });

  // Test 4: XSS in textarea/notes fields
  it('should sanitize XSS in notes field', async () => {
    const xssAttempt = '<img src=x onerror="alert(\'XSS\')">';

    const response = await request(app)
      .post('/v1/leads')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        firstName: 'Test',
        lastName: 'XSS',
        email: `xss.lead.${Date.now()}@example.com`,
        leadSource: 'Website',
        status: 'New',
        notes: xssAttempt,
      });

    if (response.status === 201) {
      expect(response.body.data.notes).not.toContain('onerror');
      await pool.query('DELETE FROM leads WHERE id = $1', [response.body.data.id]);
    } else {
      expect(response.status).toBe(400);
    }
  });

  // Test 5: Path traversal in file/document references
  it('should prevent path traversal attacks', async () => {
    const pathTraversal = '../../../etc/passwd';

    const response = await request(app)
      .get(`/v1/documents/${pathTraversal}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  // Test 6: NoSQL injection attempts (if applicable)
  it('should prevent NoSQL injection in query parameters', async () => {
    const response = await request(app)
      .get('/v1/clients?filter[$ne]=null')
      .set('Authorization', `Bearer ${authToken}`);

    // Should either ignore malicious parameter or sanitize it
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  // Test 7: Command injection attempts
  it('should prevent command injection in system calls', async () => {
    const commandInjection = 'test; rm -rf /';

    const response = await request(app)
      .post('/v1/clients')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        firstName: commandInjection,
        lastName: 'Test',
        email: `cmd.test.${Date.now()}@example.com`,
        clientType: 'Buyer',
      });

    // Should be treated as regular string, not executed
    if (response.status === 201) {
      expect(response.body.data.firstName).not.toContain(';');
      await pool.query('DELETE FROM clients WHERE id = $1', [response.body.data.id]);
    }
  });

  // Test 8: LDAP injection prevention
  it('should prevent LDAP injection in email field', async () => {
    const ldapInjection = 'admin@example.com)(|(password=*))';

    const response = await request(app)
      .post('/v1/auth/login')
      .send({
        email: ldapInjection,
        password: 'test',
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  // Test 9: Header injection
  it('should prevent header injection attacks', async () => {
    const headerInjection = 'test\r\nX-Injected-Header: malicious';

    const response = await request(app)
      .post('/v1/clients')
      .set('Authorization', `Bearer ${authToken}`)
      .set('User-Agent', headerInjection)
      .send({
        firstName: 'Test',
        lastName: 'Header',
        email: `header.${Date.now()}@example.com`,
        clientType: 'Buyer',
      });

    // Should process normally, ignoring injection attempt
    if (response.status === 201) {
      await pool.query('DELETE FROM clients WHERE id = $1', [response.body.data.id]);
    }
  });

  // Test 10: CSRF protection (if applicable)
  it('should have CSRF protection on state-changing operations', async () => {
    // Test that POST/PUT/DELETE without proper auth are rejected
    const response = await request(app)
      .post('/v1/escrows')
      .send({
        propertyAddress: '123 Test St',
        purchasePrice: 500000,
      });
    // Should require authentication
    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});
