/**
 * SecurityEventService Unit Tests
 * Phase 1: Testing Foundation & Unit Tests
 *
 * Tests all methods in SecurityEventService with mocked dependencies
 */

const SecurityEventService = require('../../../services/securityEvent.service');
const { EventTypes, EventCategories, Severity } = require('../../../services/securityEvent.service');

// Mock dependencies
jest.mock('../../../config/database', () => ({
  pool: {
    query: jest.fn(),
  },
}));

const { pool } = require('../../../config/infrastructure/database');

describe('SecurityEventService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console.error for tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  describe('logEvent', () => {
    test('should insert event into database with all fields', async () => {
      const mockEvent = {
        id: 'event-123',
        event_type: 'login_success',
        created_at: new Date(),
      };
      pool.query.mockResolvedValueOnce({ rows: [mockEvent] });

      const result = await SecurityEventService.logEvent({
        eventType: EventTypes.LOGIN_SUCCESS,
        eventCategory: EventCategories.AUTHENTICATION,
        severity: Severity.INFO,
        userId: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        requestPath: '/v1/auth/login',
        requestMethod: 'POST',
        success: true,
        message: 'User logged in',
        metadata: { test: 'data' },
        apiKeyId: null,
      });

      expect(result).toEqual(mockEvent);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO security_events'),
        expect.arrayContaining([
          'login_success',
          'authentication',
          'info',
          'user-123',
          'test@example.com',
          'testuser',
          '192.168.1.1',
          'Mozilla/5.0',
          '/v1/auth/login',
          'POST',
          true,
          'User logged in',
          JSON.stringify({ test: 'data' }),
          null,
        ])
      );
    });

    test('should handle database errors gracefully and return null', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      const result = await SecurityEventService.logEvent({
        eventType: EventTypes.LOGIN_FAILED,
        eventCategory: EventCategories.AUTHENTICATION,
        severity: Severity.WARNING,
      });

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        'Failed to log security event:',
        expect.any(Error)
      );
    });

    test('should serialize metadata as JSON', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ id: '1' }] });

      const complexMetadata = {
        user_scopes: ['read', 'write'],
        resource_id: 123,
        nested: { data: true },
      };

      await SecurityEventService.logEvent({
        eventType: EventTypes.INSUFFICIENT_SCOPE,
        eventCategory: EventCategories.AUTHORIZATION,
        severity: Severity.WARNING,
        metadata: complexMetadata,
      });

      expect(pool.query).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([JSON.stringify(complexMetadata)])
      );
    });
  });

  describe('extractRequestContext', () => {
    test('should extract IP address from req.ip', () => {
      const req = {
        ip: '192.168.1.1',
        headers: { 'user-agent': 'Mozilla/5.0' },
        originalUrl: '/v1/auth/login',
        method: 'POST',
      };

      const context = SecurityEventService.extractRequestContext(req);

      expect(context).toEqual({
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        requestPath: '/v1/auth/login',
        requestMethod: 'POST',
      });
    });

    test('should fallback to connection.remoteAddress if req.ip not available', () => {
      const req = {
        connection: { remoteAddress: '10.0.0.1' },
        headers: { 'user-agent': 'Chrome' },
        path: '/v1/test',
        method: 'GET',
      };

      const context = SecurityEventService.extractRequestContext(req);

      expect(context.ipAddress).toBe('10.0.0.1');
      expect(context.requestPath).toBe('/v1/test');
    });

    test('should handle missing fields gracefully', () => {
      const req = {
        headers: {},
      };

      const context = SecurityEventService.extractRequestContext(req);

      expect(context).toEqual({
        ipAddress: null,
        userAgent: null,
        requestPath: null,
        requestMethod: null,
      });
    });
  });

  describe('extractUserContext', () => {
    test('should extract user context from user object', () => {
      const user = {
        id: 'user-456',
        email: 'john@example.com',
        username: 'johndoe',
      };

      const context = SecurityEventService.extractUserContext(user);

      expect(context).toEqual({
        userId: 'user-456',
        email: 'john@example.com',
        username: 'johndoe',
      });
    });

    test('should return nulls if user is null', () => {
      const context = SecurityEventService.extractUserContext(null);

      expect(context).toEqual({
        userId: null,
        email: null,
        username: null,
      });
    });

    test('should handle partial user data', () => {
      const user = {
        id: 'user-789',
      };

      const context = SecurityEventService.extractUserContext(user);

      expect(context.userId).toBe('user-789');
      expect(context.email).toBeNull();
      expect(context.username).toBeNull();
    });
  });

  describe('logLoginSuccess', () => {
    test('should log successful login with correct event type', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ id: '1' }] });

      const req = {
        ip: '192.168.1.1',
        headers: { 'user-agent': 'Firefox' },
        originalUrl: '/v1/auth/login',
        method: 'POST',
      };

      const user = {
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
      };

      await SecurityEventService.logLoginSuccess(req, user);

      expect(pool.query).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([
          'login_success',
          'authentication',
          'info',
          'user-123',
          'test@example.com',
          'testuser',
          '192.168.1.1',
          'Firefox',
          '/v1/auth/login',
          'POST',
          true,
          'User logged in successfully',
        ])
      );
    });
  });

  describe('logLoginFailed', () => {
    test('should log failed login with email', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ id: '1' }] });

      const req = {
        ip: '192.168.1.2',
        headers: { 'user-agent': 'Chrome' },
        originalUrl: '/v1/auth/login',
        method: 'POST',
      };

      await SecurityEventService.logLoginFailed(req, 'test@example.com', 'Invalid password');

      expect(pool.query).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([
          'login_failed',
          'authentication',
          'warning',
          null, // userId
          'test@example.com', // email (contains @)
          null, // username
        ])
      );
    });

    test('should log failed login with username (no @)', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ id: '1' }] });

      const req = {
        ip: '192.168.1.2',
        headers: { 'user-agent': 'Chrome' },
        originalUrl: '/v1/auth/login',
        method: 'POST',
      };

      await SecurityEventService.logLoginFailed(req, 'testuser', 'Invalid credentials');

      const callArgs = pool.query.mock.calls[0][1];
      expect(callArgs[4]).toBeNull(); // email should be null
      expect(callArgs[5]).toBe('testuser'); // username should have value
    });
  });

  describe('logAccountLocked', () => {
    test('should log account lockout with failed attempts count', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ id: '1' }] });

      const req = {
        ip: '192.168.1.3',
        headers: { 'user-agent': 'Safari' },
        originalUrl: '/v1/auth/login',
        method: 'POST',
      };

      const user = {
        id: 'user-456',
        email: 'locked@example.com',
      };

      const lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
      await SecurityEventService.logAccountLocked(req, user, lockedUntil, 5);

      expect(pool.query).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([
          'account_locked',
          'authentication',
          'error',
        ])
      );

      const metadata = JSON.parse(pool.query.mock.calls[0][1][12]);
      expect(metadata.failed_attempts).toBe(5);
      expect(metadata.locked_until).toBe(lockedUntil.toISOString());
    });
  });

  describe('logLockedAccountAttempt', () => {
    test('should log attempt on locked account', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ id: '1' }] });

      const req = {
        ip: '192.168.1.4',
        headers: { 'user-agent': 'Edge' },
        originalUrl: '/v1/auth/login',
        method: 'POST',
      };

      const user = {
        id: 'user-789',
        email: 'locked@example.com',
      };

      await SecurityEventService.logLockedAccountAttempt(req, user, 25);

      expect(pool.query).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([
          'lockout_attempt_while_locked',
          'suspicious',
          'warning',
        ])
      );

      const metadata = JSON.parse(pool.query.mock.calls[0][1][12]);
      expect(metadata.minutes_remaining).toBe(25);
    });
  });

  describe('logTokenRefresh', () => {
    test('should log token refresh event', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ id: '1' }] });

      const req = {
        ip: '192.168.1.5',
        headers: { 'user-agent': 'Mobile App' },
        originalUrl: '/v1/auth/refresh',
        method: 'POST',
      };

      const user = {
        id: 'user-999',
        email: 'refresh@example.com',
      };

      await SecurityEventService.logTokenRefresh(req, user);

      expect(pool.query).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([
          'token_refresh',
          'authentication',
          'info',
          'user-999',
        ])
      );
    });
  });

  describe('logApiKeyCreated', () => {
    test('should log API key creation with key name', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ id: '1' }] });

      const req = {
        ip: '192.168.1.6',
        headers: { 'user-agent': 'Postman' },
        originalUrl: '/v1/api-keys',
        method: 'POST',
      };

      const user = {
        id: 'user-111',
        email: 'dev@example.com',
      };

      await SecurityEventService.logApiKeyCreated(req, user, 'apikey-123', 'Production Key');

      expect(pool.query).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([
          'api_key_created',
          'api_key',
          'info',
          'user-111',
        ])
      );

      const apiKeyId = pool.query.mock.calls[0][1][13];
      expect(apiKeyId).toBe('apikey-123');

      const metadata = JSON.parse(pool.query.mock.calls[0][1][12]);
      expect(metadata.key_name).toBe('Production Key');
    });
  });

  describe('logApiKeyRevoked', () => {
    test('should log API key revocation', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ id: '1' }] });

      const req = {
        ip: '192.168.1.7',
        headers: { 'user-agent': 'Dashboard' },
        originalUrl: '/v1/api-keys/abc123',
        method: 'DELETE',
      };

      const user = {
        id: 'user-222',
        email: 'admin@example.com',
      };

      await SecurityEventService.logApiKeyRevoked(req, user, 'apikey-456', 'Old Key');

      expect(pool.query).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([
          'api_key_revoked',
          'api_key',
          'warning',
        ])
      );
    });
  });

  describe('logInsufficientScope', () => {
    test('should log insufficient scope error with details', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ id: '1' }] });

      const req = {
        ip: '192.168.1.8',
        headers: { 'user-agent': 'API Client' },
        originalUrl: '/v1/clients/123',
        method: 'DELETE',
      };

      const user = {
        id: 'user-333',
        email: 'limited@example.com',
        scopes: { all: ['read'] },
      };

      await SecurityEventService.logInsufficientScope(req, user, 'clients', 'delete', 'all:delete');

      const metadata = JSON.parse(pool.query.mock.calls[0][1][12]);
      expect(metadata.resource).toBe('clients');
      expect(metadata.action).toBe('delete');
      expect(metadata.required_scope).toBe('all:delete');
      expect(metadata.user_scopes).toEqual({ all: ['read'] });
    });
  });

  describe('logRateLimitExceeded', () => {
    test('should log rate limit event', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ id: '1' }] });

      const req = {
        ip: '192.168.1.9',
        headers: { 'user-agent': 'Bot' },
        originalUrl: '/v1/escrows',
        method: 'GET',
        user: { id: 'user-444', email: 'spammer@example.com' },
      };

      await SecurityEventService.logRateLimitExceeded(req, 100, 60000);

      expect(pool.query).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([
          'rate_limit_exceeded',
          'suspicious',
          'warning',
        ])
      );

      const metadata = JSON.parse(pool.query.mock.calls[0][1][12]);
      expect(metadata.limit).toBe(100);
      expect(metadata.window_ms).toBe(60000);
    });
  });

  describe('logDataRead', () => {
    test('should log data access read event', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ id: '1' }] });

      const req = {
        ip: '192.168.1.10',
        headers: { 'user-agent': 'Web App' },
        originalUrl: '/v1/clients/456',
        method: 'GET',
        user: { id: 'user-555', email: 'agent@example.com' },
      };

      await SecurityEventService.logDataRead(req, 'client', '456', 'John Doe');

      const metadata = JSON.parse(pool.query.mock.calls[0][1][12]);
      expect(metadata.resource_type).toBe('client');
      expect(metadata.resource_id).toBe('456');
      expect(metadata.resource_name).toBe('John Doe');
    });
  });

  describe('logDataCreated', () => {
    test('should log data creation event', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ id: '1' }] });

      const req = {
        ip: '192.168.1.11',
        headers: { 'user-agent': 'Mobile' },
        originalUrl: '/v1/escrows',
        method: 'POST',
        user: { id: 'user-666', email: 'creator@example.com' },
      };

      await SecurityEventService.logDataCreated(req, 'escrow', 'escrow-789', '123 Main St');

      expect(pool.query).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([
          'data_created',
          'data_access',
          'info',
        ])
      );
    });
  });

  describe('logDataUpdated', () => {
    test('should log data update with changes', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ id: '1' }] });

      const req = {
        ip: '192.168.1.12',
        headers: { 'user-agent': 'Dashboard' },
        originalUrl: '/v1/escrows/789',
        method: 'PATCH',
        user: { id: 'user-777', email: 'editor@example.com' },
      };

      const changes = {
        status: { old: 'pending', new: 'active' },
        price: { old: 100000, new: 110000 },
      };

      await SecurityEventService.logDataUpdated(req, 'escrow', 'escrow-789', '123 Main St', changes);

      const metadata = JSON.parse(pool.query.mock.calls[0][1][12]);
      expect(metadata.changes).toEqual(changes);
    });
  });

  describe('logDataDeleted', () => {
    test('should log data deletion event', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ id: '1' }] });

      const req = {
        ip: '192.168.1.13',
        headers: { 'user-agent': 'Admin Panel' },
        originalUrl: '/v1/listings/999',
        method: 'DELETE',
        user: { id: 'user-888', email: 'admin@example.com' },
      };

      await SecurityEventService.logDataDeleted(req, 'listing', 'listing-999', '456 Oak Ave');

      expect(pool.query).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([
          'data_deleted',
          'data_access',
          'warning',
        ])
      );
    });
  });

  describe('logPermissionDenied', () => {
    test('should log permission denial with reason', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ id: '1' }] });

      const req = {
        ip: '192.168.1.14',
        headers: { 'user-agent': 'API' },
        originalUrl: '/v1/admin/users',
        method: 'GET',
        user: { id: 'user-999', email: 'agent@example.com', role: 'agent' },
      };

      await SecurityEventService.logPermissionDenied(req, 'users', 'read', 'Requires admin role');

      const metadata = JSON.parse(pool.query.mock.calls[0][1][12]);
      expect(metadata.resource).toBe('users');
      expect(metadata.action).toBe('read');
      expect(metadata.reason).toBe('Requires admin role');
      expect(metadata.user_role).toBe('agent');
    });
  });

  describe('logGeoAnomaly', () => {
    test('should log geographic anomaly event', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ id: '1' }] });

      const req = {
        ip: '203.0.113.1',
        headers: { 'user-agent': 'Chrome' },
        originalUrl: '/v1/auth/login',
        method: 'POST',
      };

      const user = {
        id: 'user-1111',
        email: 'traveler@example.com',
      };

      await SecurityEventService.logGeoAnomaly(req, user, 'Russia', 'United States');

      expect(pool.query).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([
          'geo_anomaly',
          'suspicious',
          'error',
        ])
      );

      const metadata = JSON.parse(pool.query.mock.calls[0][1][12]);
      expect(metadata.detected_country).toBe('Russia');
      expect(metadata.expected_country).toBe('United States');
    });
  });

  describe('queryEvents', () => {
    test('should query events with filters', async () => {
      const mockEvents = [
        { id: '1', event_type: 'login_success', created_at: new Date() },
        { id: '2', event_type: 'login_success', created_at: new Date() },
      ];
      pool.query.mockResolvedValueOnce({ rows: mockEvents });

      const results = await SecurityEventService.queryEvents({
        userId: 'user-123',
        eventType: 'login_success',
        limit: 50,
        offset: 0,
      });

      expect(results).toEqual(mockEvents);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE'),
        expect.arrayContaining(['user-123', 'login_success', 50, 0])
      );
    });

    test('should handle no filters (return all events)', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      await SecurityEventService.queryEvents({ limit: 100, offset: 0 });

      const query = pool.query.mock.calls[0][0];
      expect(query).not.toContain('WHERE');
      expect(query).toContain('ORDER BY created_at DESC');
    });

    test('should handle multiple filters', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      await SecurityEventService.queryEvents({
        userId: 'user-123',
        severity: 'critical',
        success: false,
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        limit: 25,
        offset: 10,
      });

      const params = pool.query.mock.calls[0][1];
      expect(params).toContain('user-123');
      expect(params).toContain('critical');
      expect(params).toContain(false);
      expect(params).toContain('2025-01-01');
      expect(params).toContain('2025-12-31');
      expect(params).toContain(25);
      expect(params).toContain(10);
    });
  });

  describe('getEventStats', () => {
    test('should return event statistics for user', async () => {
      const mockStats = [
        {
          event_category: 'authentication',
          total_events: 100,
          successful_events: 95,
          failed_events: 5,
          critical_events: 0,
          error_events: 2,
          warning_events: 3,
        },
      ];
      pool.query.mockResolvedValueOnce({ rows: mockStats });

      const results = await SecurityEventService.getEventStats('user-123', 30);

      expect(results).toEqual(mockStats);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('GROUP BY event_category'),
        expect.arrayContaining([30, 'user-123'])
      );
    });

    test('should return system-wide stats if no userId provided', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      await SecurityEventService.getEventStats(null, 7);

      const params = pool.query.mock.calls[0][1];
      expect(params).toEqual([7]); // Only daysBack, no userId
    });
  });
});
