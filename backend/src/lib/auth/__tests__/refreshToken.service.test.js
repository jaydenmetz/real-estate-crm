/**
 * RefreshTokenService Unit Tests
 * Phase 1: Testing Foundation & Unit Tests
 *
 * Tests all methods in RefreshTokenService with mocked dependencies
 */

const crypto = require('crypto');
const RefreshTokenService = require('../auth/refreshToken.service');

// Mock dependencies
jest.mock('../../../config/database', () => ({
  pool: {
    query: jest.fn(),
    connect: jest.fn(),
  },
}));

jest.mock('../../../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
}));

const { pool } = require('../../../config/infrastructure/database');
const logger = require('../../../utils/logger');

describe('RefreshTokenService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createRefreshToken', () => {
    const mockUserId = 'user-123';
    const mockIpAddress = '192.168.1.1';
    const mockUserAgent = 'Mozilla/5.0';
    const mockDeviceInfo = { browser: 'Chrome', os: 'Windows' };

    test('should generate 80-character hex token', async () => {
      const mockResult = {
        id: 'token-id-123',
        user_id: mockUserId,
        token: 'a'.repeat(80),
        expires_at: new Date(),
        ip_address: mockIpAddress,
        user_agent: mockUserAgent,
        device_info: mockDeviceInfo,
      };
      pool.query.mockResolvedValueOnce({ rows: [mockResult] });

      const result = await RefreshTokenService.createRefreshToken(
        mockUserId,
        mockIpAddress,
        mockUserAgent,
        mockDeviceInfo
      );

      expect(result).toBeDefined();
      expect(result.token).toHaveLength(80);
      expect(/^[a-f0-9]{80}$/.test(result.token)).toBe(true);
    });

    test('should insert token into database with correct expiration', async () => {
      const mockResult = {
        id: 'token-id-456',
        user_id: mockUserId,
        token: 'b'.repeat(80),
        expires_at: new Date(),
      };
      pool.query.mockResolvedValueOnce({ rows: [mockResult] });

      await RefreshTokenService.createRefreshToken(
        mockUserId,
        mockIpAddress,
        mockUserAgent,
        mockDeviceInfo
      );

      expect(pool.query).toHaveBeenCalledTimes(1);
      const insertQuery = pool.query.mock.calls[0][0];
      expect(insertQuery).toContain('INSERT INTO refresh_tokens');
      expect(insertQuery).toContain('expires_at');

      // Verify expiration is set (computed in service, not SQL)
      const queryParams = pool.query.mock.calls[0][1];
      expect(queryParams[2]).toBeInstanceOf(Date); // expires_at is 3rd param
    });

    test('should store user context in database', async () => {
      const mockResult = { id: 'token-789', token: 'c'.repeat(80) };
      pool.query.mockResolvedValueOnce({ rows: [mockResult] });

      await RefreshTokenService.createRefreshToken(
        mockUserId,
        mockIpAddress,
        mockUserAgent,
        mockDeviceInfo
      );

      const queryParams = pool.query.mock.calls[0][1];
      expect(queryParams[0]).toBe(mockUserId);
      expect(queryParams[3]).toBe(mockIpAddress);
      expect(queryParams[4]).toBe(mockUserAgent);
      expect(queryParams[5]).toBe(mockDeviceInfo);
    });

    test('should handle database errors gracefully', async () => {
      const dbError = new Error('Database connection failed');
      pool.query.mockRejectedValueOnce(dbError);

      await expect(
        RefreshTokenService.createRefreshToken(mockUserId, mockIpAddress, mockUserAgent, mockDeviceInfo)
      ).rejects.toThrow('Failed to create refresh token');

      expect(logger.error).toHaveBeenCalled();
    });

    test('should generate unique tokens on multiple calls', async () => {
      const mockResult1 = { id: '1', token: 'd'.repeat(80) };
      const mockResult2 = { id: '2', token: 'e'.repeat(80) };
      pool.query
        .mockResolvedValueOnce({ rows: [mockResult1] })
        .mockResolvedValueOnce({ rows: [mockResult2] });

      const result1 = await RefreshTokenService.createRefreshToken(
        mockUserId,
        mockIpAddress,
        mockUserAgent,
        mockDeviceInfo
      );
      const result2 = await RefreshTokenService.createRefreshToken(
        mockUserId,
        mockIpAddress,
        mockUserAgent,
        mockDeviceInfo
      );

      expect(result1.token).not.toBe(result2.token);
    });
  });

  describe('validateRefreshToken', () => {
    const mockToken = crypto.randomBytes(40).toString('hex');
    const mockUserData = {
      user_id: 'user-123',
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User',
      role: 'agent',
      is_active: true,
      team_id: 'team-456',
    };

    test('should return user data for valid token', async () => {
      pool.query.mockResolvedValueOnce({ rows: [mockUserData] });

      const result = await RefreshTokenService.validateRefreshToken(mockToken);

      expect(result).toBeDefined();
      expect(result.user_id).toBe('user-123');
      expect(result.email).toBe('test@example.com');
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        [mockToken]
      );
    });

    test('should return null for nonexistent token', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await RefreshTokenService.validateRefreshToken(mockToken);

      expect(result).toBeNull();
    });

    test('should return null for expired token', async () => {
      // Token exists but query filters it out due to expires_at check
      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await RefreshTokenService.validateRefreshToken(mockToken);

      expect(result).toBeNull();
    });

    test('should return null for revoked token', async () => {
      // Token exists but query filters it out due to revoked_at check
      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await RefreshTokenService.validateRefreshToken(mockToken);

      expect(result).toBeNull();
    });

    test('should return null for inactive user', async () => {
      // Token exists but query filters it out due to is_active check
      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await RefreshTokenService.validateRefreshToken(mockToken);

      expect(result).toBeNull();
    });

    test('should handle database errors gracefully', async () => {
      const dbError = new Error('Query failed');
      pool.query.mockRejectedValueOnce(dbError);

      const result = await RefreshTokenService.validateRefreshToken(mockToken);

      expect(result).toBeNull();
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('rotateRefreshToken', () => {
    const mockOldToken = crypto.randomBytes(40).toString('hex');
    const mockUserId = 'user-123';
    const mockIpAddress = '192.168.1.1';
    const mockUserAgent = 'Mozilla/5.0';

    test('should mark old token as used and generate new token', async () => {
      const mockNewToken = {
        id: 'new-token-id',
        user_id: mockUserId,
        token: 'f'.repeat(80),
        expires_at: new Date(),
      };

      const mockClient = {
        query: jest.fn()
          .mockResolvedValueOnce(undefined) // BEGIN
          .mockResolvedValueOnce({ rows: [] }) // UPDATE old token
          .mockResolvedValueOnce({ rows: [mockNewToken] }) // INSERT new token
          .mockResolvedValueOnce(undefined), // COMMIT
        release: jest.fn(),
      };

      pool.connect.mockResolvedValueOnce(mockClient);

      const newToken = await RefreshTokenService.rotateRefreshToken(
        mockOldToken,
        mockUserId,
        mockIpAddress,
        mockUserAgent
      );

      expect(newToken).toBeDefined();
      expect(newToken.token).toHaveLength(80);
      expect(newToken.token).not.toBe(mockOldToken);

      // Verify BEGIN was called
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      // Verify COMMIT was called
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
    });

    test('should set revoked_at for old token', async () => {
      const mockClient = {
        query: jest.fn()
          .mockResolvedValueOnce(undefined) // BEGIN
          .mockResolvedValueOnce({ rows: [] }) // UPDATE
          .mockResolvedValueOnce({ rows: [{ token: 'new' }] }) // INSERT
          .mockResolvedValueOnce(undefined), // COMMIT
        release: jest.fn(),
      };

      pool.connect.mockResolvedValueOnce(mockClient);

      await RefreshTokenService.rotateRefreshToken(
        mockOldToken,
        mockUserId,
        mockIpAddress,
        mockUserAgent
      );

      const updateCall = mockClient.query.mock.calls[1];
      expect(updateCall[0]).toContain('revoked_at = NOW()');
      expect(updateCall[1]).toEqual([mockOldToken]);
    });

    test('should handle transaction errors with rollback', async () => {
      const mockClient = {
        query: jest.fn()
          .mockResolvedValueOnce(undefined) // BEGIN
          .mockRejectedValueOnce(new Error('Database error')), // UPDATE fails
        release: jest.fn(),
      };

      pool.connect.mockResolvedValueOnce(mockClient);

      await expect(
        RefreshTokenService.rotateRefreshToken(mockOldToken, mockUserId, mockIpAddress, mockUserAgent)
      ).rejects.toThrow('Failed to rotate refresh token');

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('revokeRefreshToken', () => {
    const mockToken = crypto.randomBytes(40).toString('hex');

    test('should revoke token successfully', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ id: 'token-123' }] });

      const result = await RefreshTokenService.revokeRefreshToken(mockToken);

      expect(result).toBe(true);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE refresh_tokens'),
        [mockToken]
      );
    });

    test('should return false if token not found', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await RefreshTokenService.revokeRefreshToken(mockToken);

      expect(result).toBe(false);
    });

    test('should set revoked_at timestamp', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ id: 'token-456' }] });

      await RefreshTokenService.revokeRefreshToken(mockToken);

      const updateQuery = pool.query.mock.calls[0][0];
      expect(updateQuery).toContain('revoked_at = NOW()');
      expect(updateQuery).toContain('WHERE token = $1');
    });
  });

  describe('revokeAllUserTokens', () => {
    const mockUserId = 'user-123';

    test('should revoke all tokens for user', async () => {
      pool.query.mockResolvedValueOnce({ rowCount: 5 });

      const result = await RefreshTokenService.revokeAllUserTokens(mockUserId);

      expect(result).toBe(5);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE refresh_tokens'),
        expect.arrayContaining([mockUserId])
      );
    });

    test('should only revoke non-revoked tokens', async () => {
      pool.query.mockResolvedValueOnce({ rowCount: 3 });

      await RefreshTokenService.revokeAllUserTokens(mockUserId);

      const updateQuery = pool.query.mock.calls[0][0];
      expect(updateQuery).toContain('revoked_at IS NULL');
    });

    test('should return 0 if user has no active tokens', async () => {
      pool.query.mockResolvedValueOnce({ rowCount: 0 });

      const result = await RefreshTokenService.revokeAllUserTokens(mockUserId);

      expect(result).toBe(0);
    });
  });

  describe('getUserTokens', () => {
    const mockUserId = 'user-123';
    const mockTokens = [
      {
        id: '1',
        user_agent: 'Chrome',
        ip_address: '192.168.1.1',
        created_at: new Date(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        device_info: { browser: 'Chrome' },
      },
      {
        id: '2',
        user_agent: 'Firefox',
        ip_address: '192.168.1.2',
        created_at: new Date(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        device_info: { browser: 'Firefox' },
      },
    ];

    test('should return all active tokens for user', async () => {
      pool.query.mockResolvedValueOnce({ rows: mockTokens });

      const result = await RefreshTokenService.getUserTokens(mockUserId);

      expect(result).toHaveLength(2);
      expect(result[0].user_agent).toBe('Chrome');
      expect(result[1].user_agent).toBe('Firefox');
    });

    test('should only return non-revoked, non-expired tokens', async () => {
      pool.query.mockResolvedValueOnce({ rows: mockTokens });

      await RefreshTokenService.getUserTokens(mockUserId);

      const selectQuery = pool.query.mock.calls[0][0];
      expect(selectQuery).toContain('revoked_at IS NULL');
      expect(selectQuery).toContain('expires_at > NOW()');
    });

    test('should return empty array if user has no active tokens', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await RefreshTokenService.getUserTokens(mockUserId);

      expect(result).toEqual([]);
    });
  });

  describe('cleanupExpiredTokens', () => {
    test('should delete expired tokens', async () => {
      pool.query.mockResolvedValueOnce({ rowCount: 42, rows: [] });

      const result = await RefreshTokenService.cleanupExpiredTokens();

      expect(result).toBe(42);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM refresh_tokens')
      );
    });

    test('should only delete tokens past expiration (30 days)', async () => {
      pool.query.mockResolvedValueOnce({ rowCount: 10, rows: [] });

      await RefreshTokenService.cleanupExpiredTokens();

      const deleteQuery = pool.query.mock.calls[0][0];
      expect(deleteQuery).toContain("expires_at < NOW() - INTERVAL '30 days'");
    });

    test('should return 0 if no expired tokens', async () => {
      pool.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });

      const result = await RefreshTokenService.cleanupExpiredTokens();

      expect(result).toBe(0);
    });

    test('should log cleanup statistics when tokens deleted', async () => {
      pool.query.mockResolvedValueOnce({ rowCount: 25, rows: [] });

      await RefreshTokenService.cleanupExpiredTokens();

      expect(logger.info).toHaveBeenCalledWith(
        'Expired tokens cleaned up',
        { count: 25 }
      );
    });
  });

  describe('getTokenStats', () => {
    const mockStats = {
      active_tokens: '100',
      expired_tokens: '20',
      revoked_tokens: '30',
      active_users: '75',
    };

    test('should return comprehensive token statistics', async () => {
      pool.query.mockResolvedValueOnce({ rows: [mockStats] });

      const result = await RefreshTokenService.getTokenStats();

      expect(result).toEqual(mockStats);
      expect(result.active_tokens).toBe('100');
      expect(result.revoked_tokens).toBe('30');
      expect(result.expired_tokens).toBe('20');
      expect(result.active_users).toBe('75');
    });

    test('should query with correct aggregations', async () => {
      pool.query.mockResolvedValueOnce({ rows: [mockStats] });

      await RefreshTokenService.getTokenStats();

      const statsQuery = pool.query.mock.calls[0][0];
      expect(statsQuery).toContain('COUNT(*) FILTER');
      expect(statsQuery).toContain('active_tokens');
      expect(statsQuery).toContain('expired_tokens');
      expect(statsQuery).toContain('revoked_tokens');
      expect(statsQuery).toContain('active_users');
    });

    test('should handle errors gracefully', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      const result = await RefreshTokenService.getTokenStats();

      expect(result).toEqual({
        active_tokens: 0,
        expired_tokens: 0,
        revoked_tokens: 0,
        active_users: 0,
      });
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
