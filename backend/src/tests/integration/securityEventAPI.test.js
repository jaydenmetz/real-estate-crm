/**
 * Integration Tests: Security Events API Endpoints
 * Tests GET /v1/security-events/* endpoints
 */

const request = require('supertest');
const app = require('../../app');
const { pool } = require('../../config/database');
const jwt = require('jsonwebtoken');

describe('Security Events API Endpoints', () => {
  let testUser;
  let adminUser;
  let testToken;
  let adminToken;
  const jwtSecret = process.env.JWT_SECRET;

  beforeAll(async () => {
    // Create test user (agent)
    const bcrypt = require('bcryptjs');
    const testPassword = await bcrypt.hash('TestPassword123!', 10);

    const testUserResult = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role, is_active)
       VALUES ($1, $2, 'Test', 'User', 'agent', true)
       RETURNING id, email, role`,
      [`test-api-${Date.now()}@example.com`, testPassword],
    );
    testUser = testUserResult.rows[0];

    // Create admin user
    const adminUserResult = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role, is_active)
       VALUES ($1, $2, 'Admin', 'User', 'system_admin', true)
       RETURNING id, email, role`,
      [`admin-api-${Date.now()}@example.com`, testPassword],
    );
    adminUser = adminUserResult.rows[0];

    // Generate JWT tokens
    testToken = jwt.sign(
      { id: testUser.id, email: testUser.email, role: testUser.role },
      jwtSecret,
      { expiresIn: '1h' },
    );

    adminToken = jwt.sign(
      { id: adminUser.id, email: adminUser.email, role: adminUser.role },
      jwtSecret,
      { expiresIn: '1h' },
    );

    // Create some test security events
    for (let i = 0; i < 5; i++) {
      await pool.query(
        `INSERT INTO security_events (
          event_type, event_category, severity, user_id, email,
          ip_address, success, message
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          'login_success',
          'authentication',
          'info',
          testUser.id,
          testUser.email,
          '192.168.1.1',
          true,
          'Test login event',
        ],
      );
    }
  });

  afterAll(async () => {
    // Cleanup
    await pool.query('DELETE FROM security_events WHERE user_id = $1', [testUser.id]);
    await pool.query('DELETE FROM security_events WHERE user_id = $1', [adminUser.id]);
    await pool.query('DELETE FROM users WHERE id = $1', [testUser.id]);
    await pool.query('DELETE FROM users WHERE id = $1', [adminUser.id]);
  });

  describe('GET /v1/security-events', () => {
    it('should require authentication', async () => {
      const res = await request(app)
        .get('/v1/security-events');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NO_AUTH_TOKEN');
    });

    it('should return user\'s own security events', async () => {
      const res = await request(app)
        .get('/v1/security-events')
        .set('Authorization', `Bearer ${testToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);

      // All events should belong to test user
      res.body.data.forEach((event) => {
        expect(event.user_id).toBe(testUser.id);
      });
    });

    it('should support filtering by event type', async () => {
      const res = await request(app)
        .get('/v1/security-events?eventType=login_success')
        .set('Authorization', `Bearer ${testToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      res.body.data.forEach((event) => {
        expect(event.event_type).toBe('login_success');
      });
    });

    it('should support filtering by event category', async () => {
      const res = await request(app)
        .get('/v1/security-events?eventCategory=authentication')
        .set('Authorization', `Bearer ${testToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      res.body.data.forEach((event) => {
        expect(event.event_category).toBe('authentication');
      });
    });

    it('should support filtering by severity', async () => {
      const res = await request(app)
        .get('/v1/security-events?severity=info')
        .set('Authorization', `Bearer ${testToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      res.body.data.forEach((event) => {
        expect(event.severity).toBe('info');
      });
    });

    it('should support filtering by success status', async () => {
      const res = await request(app)
        .get('/v1/security-events?success=true')
        .set('Authorization', `Bearer ${testToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      res.body.data.forEach((event) => {
        expect(event.success).toBe(true);
      });
    });

    it('should support pagination with limit and offset', async () => {
      const res = await request(app)
        .get('/v1/security-events?limit=2&offset=0')
        .set('Authorization', `Bearer ${testToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeLessThanOrEqual(2);
      expect(res.body.pagination.limit).toBe(2);
      expect(res.body.pagination.offset).toBe(0);
    });

    it('should enforce max limit of 500', async () => {
      const res = await request(app)
        .get('/v1/security-events?limit=1000')
        .set('Authorization', `Bearer ${testToken}`);

      expect(res.status).toBe(200);
      expect(res.body.pagination.limit).toBe(500); // Capped at 500
    });

    it('should allow admin to view all events', async () => {
      const res = await request(app)
        .get('/v1/security-events')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      // Admin should see events from multiple users
    });
  });

  describe('GET /v1/security-events/stats', () => {
    it('should require authentication', async () => {
      const res = await request(app)
        .get('/v1/security-events/stats');

      expect(res.status).toBe(401);
    });

    it('should return event statistics for user', async () => {
      const res = await request(app)
        .get('/v1/security-events/stats')
        .set('Authorization', `Bearer ${testToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.stats).toBeDefined();
      expect(Array.isArray(res.body.data.stats)).toBe(true);
      expect(res.body.data.period).toBeDefined();
      expect(res.body.data.period.days).toBe(30); // Default
    });

    it('should support custom days back parameter', async () => {
      const res = await request(app)
        .get('/v1/security-events/stats?daysBack=7')
        .set('Authorization', `Bearer ${testToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.period.days).toBe(7);
    });

    it('should cap days back at 365', async () => {
      const res = await request(app)
        .get('/v1/security-events/stats?daysBack=500')
        .set('Authorization', `Bearer ${testToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.period.days).toBe(365); // Capped
    });

    it('should return stats grouped by category', async () => {
      const res = await request(app)
        .get('/v1/security-events/stats')
        .set('Authorization', `Bearer ${testToken}`);

      expect(res.status).toBe(200);
      if (res.body.data.stats.length > 0) {
        const stat = res.body.data.stats[0];
        expect(stat.event_category).toBeDefined();
        expect(stat.total_events).toBeDefined();
        expect(stat.successful_events).toBeDefined();
        expect(stat.failed_events).toBeDefined();
      }
    });
  });

  describe('GET /v1/security-events/recent', () => {
    it('should require authentication', async () => {
      const res = await request(app)
        .get('/v1/security-events/recent');

      expect(res.status).toBe(401);
    });

    it('should return last 50 events for user', async () => {
      const res = await request(app)
        .get('/v1/security-events/recent')
        .set('Authorization', `Bearer ${testToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeLessThanOrEqual(50);

      // All events should belong to test user
      res.body.data.forEach((event) => {
        expect(event.user_id).toBe(testUser.id);
      });
    });

    it('should return events in descending order by date', async () => {
      const res = await request(app)
        .get('/v1/security-events/recent')
        .set('Authorization', `Bearer ${testToken}`);

      expect(res.status).toBe(200);
      if (res.body.data.length > 1) {
        const firstDate = new Date(res.body.data[0].created_at);
        const secondDate = new Date(res.body.data[1].created_at);
        expect(firstDate >= secondDate).toBe(true);
      }
    });
  });

  describe('GET /v1/security-events/critical', () => {
    it('should require authentication', async () => {
      const res = await request(app)
        .get('/v1/security-events/critical');

      expect(res.status).toBe(401);
    });

    it('should require system_admin role', async () => {
      const res = await request(app)
        .get('/v1/security-events/critical')
        .set('Authorization', `Bearer ${testToken}`); // Regular user

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('should return critical events for admin', async () => {
      const res = await request(app)
        .get('/v1/security-events/critical')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.period).toBeDefined();
      expect(res.body.period.days).toBe(7); // Default
    });

    it('should support custom days back parameter', async () => {
      const res = await request(app)
        .get('/v1/security-events/critical?daysBack=30')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.period.days).toBe(30);
    });

    it('should cap days back at 90', async () => {
      const res = await request(app)
        .get('/v1/security-events/critical?daysBack=200')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.period.days).toBe(90); // Capped
    });

    it('should only return critical severity events', async () => {
      const res = await request(app)
        .get('/v1/security-events/critical')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      res.body.data.forEach((event) => {
        expect(event.severity).toBe('critical');
      });
    });
  });

  describe('GET /v1/security-events/health', () => {
    it('should be publicly accessible (no auth required)', async () => {
      const res = await request(app)
        .get('/v1/security-events/health');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return health status', async () => {
      const res = await request(app)
        .get('/v1/security-events/health');

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('healthy');
      expect(res.body.data.checks).toBeDefined();
    });

    it('should check database connectivity', async () => {
      const res = await request(app)
        .get('/v1/security-events/health');

      expect(res.body.data.checks.database).toBeDefined();
      expect(res.body.data.checks.database.status).toBe('healthy');
      expect(res.body.data.checks.database.totalEvents).toBeGreaterThan(0);
    });

    it('should check recent activity', async () => {
      const res = await request(app)
        .get('/v1/security-events/health');

      expect(res.body.data.checks.recentActivity).toBeDefined();
      expect(res.body.data.checks.recentActivity.status).toBeDefined();
    });

    it('should show top event types', async () => {
      const res = await request(app)
        .get('/v1/security-events/health');

      expect(res.body.data.checks.eventTypes).toBeDefined();
      expect(res.body.data.checks.eventTypes.status).toBe('healthy');
      expect(Array.isArray(res.body.data.checks.eventTypes.topEventsLast7Days)).toBe(true);
    });
  });
});
