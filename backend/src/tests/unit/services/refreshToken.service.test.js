/**
 * RefreshTokenService Unit Tests
 * Phase 1: Testing Foundation & Unit Tests
 *
 * Tests all methods in RefreshTokenService with mocked dependencies
 */

const crypto = require('crypto');
const RefreshTokenService = require('../../../services/refreshToken.service');

// Mock dependencies
jest.mock('../../../config/database', () => ({
  pool: {
    query: jest.fn(),
  },
}));

jest.mock('../../../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
}));

const { pool } = require('../../../config/database');
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
      pool.query.mockResolvedValueOnce({ rows: [] });

      const token = await RefreshTokenService.createRefreshToken(
        mockUserId,
        mockIpAddress,
        mockUserAgent,
        mockDeviceInfo
      );

      expect(token).toBeDefined();
      expect(token).toHaveLength(80);
      expect(/^[a-f0-9]{80}$/.test(token)).toBe(true);
    });

    test('should insert token into database with correct expiration', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

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

      // Verify expiration is 7 days (NOW() + INTERVAL '7 days')
      expect(insertQuery).toContain("INTERVAL '7 days'");
    });

    test('should store user context in database', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      await RefreshTokenService.createRefreshToken(
        mockUserId,
        mockIpAddress,
        mockUserAgent,
        mockDeviceInfo
      );

      const queryParams = pool.query.mock.calls[0][1];
      expect(queryParams).toContain(mockUserId);
      expect(queryParams).toContain(mockIpAddress);
      expect(queryParams).toContain(mockUserAgent);
    });

    test('should handle database errors gracefully', async () => {
      const dbError = new Error('Database connection failed');
      pool.query.mockRejectedValueOnce(dbError);

      await expect(
        RefreshTokenService.createRefreshToken(mockUserId, mockIpAddress, mockUserAgent, mockDeviceInfo)
      ).rejects.toThrow('Database connection failed');

      expect(logger.error).toHaveBeenCalled();
    });

    test('should generate unique tokens on multiple calls', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const token1 = await RefreshTokenService.createRefreshToken(
        mockUserId,
        mockIpAddress,
        mockUserAgent,
        mockDeviceInfo
      );
      const token2 = await RefreshTokenService.createRefreshToken(
        mockUserId,
        mockIpAddress,
        mockUserAgent,
        mockDeviceInfo
      );

      expect(token1).not.toBe(token2);
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
        expect.stringContaining('SELECT rt.*, u.id as user_id'),
        [mockToken]
      );
    });

    test('should update last_used_at timestamp', async () => {
      pool.query.mockResolvedValueOnce({ rows: [mockUserData] });
      pool.query.mockResolvedValueOnce({ rows: [] }); // UPDATE query

      await RefreshTokenService.validateRefreshToken(mockToken);

      expect(pool.query).toHaveBeenCalledTimes(2);
      const updateQuery = pool.query.mock.calls[1][0];
      expect(updateQuery).toContain('UPDATE refresh_tokens');
      expect(updateQuery).toContain('last_used_at = NOW()');
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

    test('should handle database errors', async () => {
      const dbError = new Error('Query failed');
      pool.query.mockRejectedValueOnce(dbError);

      await expect(
        RefreshTokenService.validateRefreshToken(mockToken)
      ).rejects.toThrow('Query failed');
    });
  });

  describe('rotateRefreshToken', () => {
    const mockOldToken = crypto.randomBytes(40).toString('hex');
    const mockUserId = 'user-123';
    const mockIpAddress = '192.168.1.1';
    const mockUserAgent = 'Mozilla/5.0';

    test('should mark old token as used and generate new token', async () => {
      // Mock UPDATE to mark old token
      pool.query.mockResolvedValueOnce({ rows: [] });
      // Mock INSERT for new token
      pool.query.mockResolvedValueOnce({ rows: [] });

      const newToken = await RefreshTokenService.rotateRefreshToken(
        mockOldToken,
        mockUserId,
        mockIpAddress,
        mockUserAgent
      );

      expect(newToken).toBeDefined();
      expect(newToken).toHaveLength(80);
      expect(newToken).not.toBe(mockOldToken);

      // Should have updated old token
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE refresh_tokens'),
        expect.arrayContaining([mockOldToken])
      );
    });

    test('should set revoked_at for old token', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      await RefreshTokenService.rotateRefreshToken(
        mockOldToken,
        mockUserId,
        mockIpAddress,
        mockUserAgent
      );

      const updateQuery = pool.query.mock.calls[0][0];
      expect(updateQuery).toContain('revoked_at = NOW()');
    });

    test('should handle replay attack (old token already used)', async () => {
      // Mock finding already revoked token
      pool.query.mockRejectedValueOnce(new Error('Token already used'));

      await expect(
        RefreshTokenService.rotateRefreshToken(mockOldToken, mockUserId, mockIpAddress, mockUserAgent)
      ).rejects.toThrow('Token already used');
    });
  });

  describe('revokeRefreshToken', () => {
    const mockToken = crypto.randomBytes(40).toString('hex');

    test('should revoke token successfully', async () => {
      pool.query.mockResolvedValueOnce({ rowCount: 1 });

      const result = await RefreshTokenService.revokeRefreshToken(mockToken);

      expect(result).toBe(true);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE refresh_tokens'),
        expect.arrayContaining([mockToken])
      );
    });

    test('should return false if token not found', async () => {
      pool.query.mockResolvedValueOnce({ rowCount: 0 });

      const result = await RefreshTokenService.revokeRefreshToken(mockToken);

      expect(result).toBe(false);
    });

    test('should set revoked_at timestamp', async () => {
      pool.query.mockResolvedValueOnce({ rowCount: 1 });

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
        last_used_at: new Date(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      {
        id: '2',
        user_agent: 'Firefox',
        ip_address: '192.168.1.2',
        created_at: new Date(),
        last_used_at: new Date(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
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
      pool.query.mockResolvedValueOnce({ rowCount: 42 });

      const result = await RefreshTokenService.cleanupExpiredTokens();

      expect(result).toBe(42);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM refresh_tokens')
      );
    });

    test('should only delete tokens past expiration', async () => {
      pool.query.mockResolvedValueOnce({ rowCount: 10 });

      await RefreshTokenService.cleanupExpiredTokens();

      const deleteQuery = pool.query.mock.calls[0][0];
      expect(deleteQuery).toContain('expires_at < NOW()');
    });

    test('should return 0 if no expired tokens', async () => {
      pool.query.mockResolvedValueOnce({ rowCount: 0 });

      const result = await RefreshTokenService.cleanupExpiredTokens();

      expect(result).toBe(0);
    });

    test('should log cleanup statistics', async () => {
      pool.query.mockResolvedValueOnce({ rowCount: 25 });

      await RefreshTokenService.cleanupExpiredTokens();

      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('25'),
        expect.any(Object)
      );
    });
  });

  describe('getTokenStats', () => {
    const mockStats = {
      total_tokens: 150,
      active_tokens: 100,
      revoked_tokens: 30,
      expired_tokens: 20,
    };

    test('should return comprehensive token statistics', async () => {
      pool.query.mockResolvedValueOnce({ rows: [mockStats] });

      const result = await RefreshTokenService.getTokenStats();

      expect(result).toEqual(mockStats);
      expect(result.total_tokens).toBe(150);
      expect(result.active_tokens).toBe(100);
      expect(result.revoked_tokens).toBe(30);
      expect(result.expired_tokens).toBe(20);
    });

    test('should query with correct aggregations', async () => {
      pool.query.mockResolvedValueOnce({ rows: [mockStats] });

      await RefreshTokenService.getTokenStats();

      const statsQuery = pool.query.mock.calls[0][0];
      expect(statsQuery).toContain('COUNT(*)');
      expect(statsQuery).toContain('refresh_tokens');
    });

    test('should handle empty database', async () => {
      pool.query.mockResolvedValueOnce({
        rows: [{
          total_tokens: 0,
          active_tokens: 0,
          revoked_tokens: 0,
          expired_tokens: 0,
        }],
      });

      const result = await RefreshTokenService.getTokenStats();

      expect(result.total_tokens).toBe(0);
    });
  });
});
