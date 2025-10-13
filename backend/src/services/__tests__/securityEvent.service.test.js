/**
 * Unit Tests for Security Event Service
 *
 * PHASE 7: Testing Foundation
 * Target: 80%+ coverage
 */

const { pool } = require('../../config/database');
const SecurityEventService = require('../securityEvent.service');

// Mock the database pool
jest.mock('../../config/database', () => ({
  pool: {
    query: jest.fn()
  }
}));

describe('SecurityEventService', () => {
  let mockReq;
  let mockUser;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Mock request object
    mockReq = {
      ip: '192.168.1.100',
      headers: {
        'user-agent': 'Mozilla/5.0 (Test Browser)'
      },
      originalUrl: '/api/v1/test',
      method: 'GET',
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        username: 'testuser'
      }
    };

    // Mock user object
    mockUser = {
      id: 'test-user-id',
      email: 'test@example.com',
      username: 'testuser',
      role: 'agent',
      teamId: 'test-team-id'
    };

    // Default successful query response
    pool.query.mockResolvedValue({ rows: [{ id: 'event-id-123' }], rowCount: 1 });
  });

  describe('logLoginSuccess', () => {
    it('should log successful login event', async () => {
      await SecurityEventService.logLoginSuccess(mockReq, mockUser);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO security_events'),
        expect.arrayContaining([
          'login_success',
          'authentication',
          'info',
          mockUser.id,
          mockUser.email,
          mockUser.username,
          mockReq.ip,
          mockReq.headers['user-agent'],
          mockReq.originalUrl,
          mockReq.method,
          true,
          expect.stringContaining('User logged in successfully')
        ])
      );
    });

    it('should handle database errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      pool.query.mockRejectedValue(new Error('Database connection failed'));

      const result = await SecurityEventService.logLoginSuccess(mockReq, mockUser);

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error logging security event:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should work without user email (optional field)', async () => {
      const userWithoutEmail = { ...mockUser, email: null };

      await SecurityEventService.logLoginSuccess(mockReq, userWithoutEmail);

      expect(pool.query).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([null]) // email should be null
      );
    });
  });

  describe('logLoginFailed', () => {
    it('should log failed login with reason', async () => {
      const emailOrUsername = 'test@example.com';
      const reason = 'Invalid password';

      await SecurityEventService.logLoginFailed(mockReq, emailOrUsername, reason);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO security_events'),
        expect.arrayContaining([
          'login_failed',
          'authentication',
          'warning',
          null, // user_id is null for failed logins
          emailOrUsername,
          null, // username is null
          mockReq.ip,
          mockReq.headers['user-agent'],
          mockReq.originalUrl,
          mockReq.method,
          false, // success = false
          expect.stringContaining(reason)
        ])
      );
    });

    it('should handle missing reason parameter', async () => {
      await SecurityEventService.logLoginFailed(mockReq, 'test@example.com');

      expect(pool.query).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([
          expect.stringContaining('Login failed')
        ])
      );
    });
  });

  describe('logAccountLocked', () => {
    it('should log account lockout with attempt count', async () => {
      const lockedUntil = new Date('2025-10-13T12:00:00Z');
      const failedAttempts = 5;

      await SecurityEventService.logAccountLocked(
        mockReq,
        mockUser,
        lockedUntil,
        failedAttempts
      );

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO security_events'),
        expect.arrayContaining([
          'account_locked',
          'account',
          'error',
          mockUser.id,
          mockUser.email,
          mockUser.username,
          mockReq.ip,
          mockReq.headers['user-agent'],
          mockReq.originalUrl,
          mockReq.method,
          false,
          expect.stringContaining('Account locked'),
          expect.objectContaining({
            locked_until: lockedUntil.toISOString(),
            failed_attempts: failedAttempts
          })
        ])
      );
    });
  });

  describe('logTokenRefresh', () => {
    it('should log successful token refresh', async () => {
      await SecurityEventService.logTokenRefresh(mockReq, mockUser);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO security_events'),
        expect.arrayContaining([
          'token_refresh',
          'authentication',
          'info',
          mockUser.id,
          mockUser.email,
          mockUser.username,
          true
        ])
      );
    });
  });

  describe('logApiKeyCreated', () => {
    it('should log API key creation with key details', async () => {
      const apiKeyId = 'api-key-123';
      const keyName = 'Production Key';

      await SecurityEventService.logApiKeyCreated(
        mockReq,
        mockUser,
        apiKeyId,
        keyName
      );

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO security_events'),
        expect.arrayContaining([
          'api_key_created',
          'api_key',
          'info',
          mockUser.id,
          mockUser.email,
          mockUser.username,
          true,
          expect.stringContaining('API key created'),
          expect.objectContaining({
            api_key_name: keyName
          }),
          apiKeyId
        ])
      );
    });

    it('should work without key name (optional)', async () => {
      const apiKeyId = 'api-key-123';

      await SecurityEventService.logApiKeyCreated(
        mockReq,
        mockUser,
        apiKeyId
      );

      expect(pool.query).toHaveBeenCalled();
    });
  });

  describe('logApiKeyRevoked', () => {
    it('should log API key revocation', async () => {
      const apiKeyId = 'api-key-123';
      const keyName = 'Test Key';

      await SecurityEventService.logApiKeyRevoked(
        mockReq,
        mockUser,
        apiKeyId,
        keyName
      );

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO security_events'),
        expect.arrayContaining([
          'api_key_revoked',
          'api_key',
          'warning',
          mockUser.id,
          true,
          expect.stringContaining('API key revoked'),
          apiKeyId
        ])
      );
    });
  });

  describe('queryEvents', () => {
    it('should query events with filters', async () => {
      const filters = {
        userId: mockUser.id,
        eventType: 'login_success',
        startDate: '2025-10-01',
        endDate: '2025-10-13',
        limit: 50,
        offset: 0
      };

      pool.query.mockResolvedValue({
        rows: [
          {
            id: 'event-1',
            event_type: 'login_success',
            created_at: '2025-10-13T10:00:00Z'
          }
        ]
      });

      const result = await SecurityEventService.queryEvents(filters);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        expect.arrayContaining([
          mockUser.id,
          'login_success',
          expect.any(String), // startDate
          expect.any(String), // endDate
          50,
          0
        ])
      );

      expect(result).toEqual([
        expect.objectContaining({
          id: 'event-1',
          event_type: 'login_success'
        })
      ]);
    });

    it('should work without filters (return all events)', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const result = await SecurityEventService.queryEvents({});

      expect(pool.query).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should handle query errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      pool.query.mockRejectedValue(new Error('Query failed'));

      const result = await SecurityEventService.queryEvents({});

      expect(result).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('getEventStats', () => {
    it('should return event statistics by category', async () => {
      pool.query.mockResolvedValue({
        rows: [
          {
            event_category: 'authentication',
            total_events: 100,
            successful_events: 95,
            failed_events: 5
          },
          {
            event_category: 'api_key',
            total_events: 20,
            successful_events: 20,
            failed_events: 0
          }
        ]
      });

      const result = await SecurityEventService.getEventStats(30);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('GROUP BY event_category'),
        expect.arrayContaining([30])
      );

      expect(result).toEqual([
        {
          event_category: 'authentication',
          total_events: 100,
          successful_events: 95,
          failed_events: 5
        },
        {
          event_category: 'api_key',
          total_events: 20,
          successful_events: 20,
          failed_events: 0
        }
      ]);
    });

    it('should default to 30 days if no parameter provided', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      await SecurityEventService.getEventStats();

      expect(pool.query).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([30])
      );
    });
  });

  describe('Fire-and-Forget Pattern', () => {
    it('should not block on database errors', async () => {
      pool.query.mockRejectedValue(new Error('Database error'));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Call without await (fire-and-forget)
      const promise = SecurityEventService.logLoginSuccess(mockReq, mockUser);

      // Promise should resolve quickly even with database error
      await expect(promise).resolves.toBeNull();

      consoleErrorSpy.mockRestore();
    });

    it('should complete within 10ms (fast, non-blocking)', async () => {
      const startTime = Date.now();

      await SecurityEventService.logLoginSuccess(mockReq, mockUser);

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(10); // Should be < 10ms
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing request IP', async () => {
      const reqWithoutIp = { ...mockReq, ip: undefined };

      await SecurityEventService.logLoginSuccess(reqWithoutIp, mockUser);

      expect(pool.query).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([null]) // IP should be null
      );
    });

    it('should handle missing user-agent header', async () => {
      const reqWithoutUserAgent = {
        ...mockReq,
        headers: {}
      };

      await SecurityEventService.logLoginSuccess(reqWithoutUserAgent, mockUser);

      expect(pool.query).toHaveBeenCalled();
    });

    it('should handle very long metadata objects', async () => {
      const longMetadata = {
        key1: 'a'.repeat(1000),
        key2: 'b'.repeat(1000),
        key3: { nested: 'c'.repeat(1000) }
      };

      await SecurityEventService.logEvent({
        eventType: 'test_event',
        eventCategory: 'test',
        severity: 'info',
        userId: mockUser.id,
        email: mockUser.email,
        ipAddress: mockReq.ip,
        userAgent: mockReq.headers['user-agent'],
        requestPath: mockReq.originalUrl,
        requestMethod: mockReq.method,
        success: true,
        message: 'Test',
        metadata: longMetadata
      });

      expect(pool.query).toHaveBeenCalled();
    });
  });
});
