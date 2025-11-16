/**
 * ApiKeyService Unit Tests
 * Phase 1: Testing Foundation & Unit Tests
 *
 * Tests all methods in ApiKeyService with mocked dependencies
 */

const crypto = require('crypto');
const ApiKeyService = require('../../../lib/auth/apiKey.service');

// Mock dependencies
jest.mock('../../../config/database', () => ({
  pool: {
    query: jest.fn(),
    connect: jest.fn(),
  },
}));

const { pool } = require('../../../config/infrastructure/database');

describe('ApiKeyService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console.error for tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  describe('generateApiKey', () => {
    test('should generate 64-character hex string', () => {
      const key = ApiKeyService.generateApiKey();

      expect(key).toHaveLength(64);
      expect(/^[a-f0-9]{64}$/.test(key)).toBe(true);
    });

    test('should generate unique keys on multiple calls', () => {
      const key1 = ApiKeyService.generateApiKey();
      const key2 = ApiKeyService.generateApiKey();

      expect(key1).not.toBe(key2);
    });
  });

  describe('hashApiKey', () => {
    test('should hash API key using SHA-256', () => {
      const apiKey = 'a'.repeat(64);
      const hash = ApiKeyService.hashApiKey(apiKey);

      expect(hash).toHaveLength(64);
      expect(/^[a-f0-9]{64}$/.test(hash)).toBe(true);
    });

    test('should produce consistent hashes for same input', () => {
      const apiKey = 'test_api_key_123';
      const hash1 = ApiKeyService.hashApiKey(apiKey);
      const hash2 = ApiKeyService.hashApiKey(apiKey);

      expect(hash1).toBe(hash2);
    });

    test('should produce different hashes for different inputs', () => {
      const hash1 = ApiKeyService.hashApiKey('key1');
      const hash2 = ApiKeyService.hashApiKey('key2');

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('createApiKey', () => {
    test('should create API key with default scopes', async () => {
      const mockClient = {
        query: jest.fn()
          .mockResolvedValueOnce(undefined) // BEGIN
          .mockResolvedValueOnce({ rows: [{ team_id: 'team-123' }] }) // User query
          .mockResolvedValueOnce({
            rows: [{
              id: 'apikey-456',
              name: 'Test Key',
              key_prefix: 'abcd1234...wxyz',
              scopes: { all: ['read', 'write', 'delete'] },
              expires_at: null,
              created_at: new Date(),
            }],
          }) // INSERT query
          .mockResolvedValueOnce(undefined), // COMMIT
        release: jest.fn(),
      };

      pool.connect.mockResolvedValueOnce(mockClient);

      const result = await ApiKeyService.createApiKey('user-123', 'Test Key', null);

      expect(result).toHaveProperty('key');
      expect(result.key).toHaveLength(64);
      expect(result.id).toBe('apikey-456');
      expect(result.name).toBe('Test Key');

      // Verify transaction was committed
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.release).toHaveBeenCalled();
    });

    test('should create API key with expiration date', async () => {
      const mockClient = {
        query: jest.fn()
          .mockResolvedValueOnce(undefined) // BEGIN
          .mockResolvedValueOnce({ rows: [{ team_id: 'team-456' }] })
          .mockResolvedValueOnce({
            rows: [{
              id: 'apikey-789',
              name: 'Expiring Key',
              key_prefix: 'test1234...5678',
              scopes: { all: ['read', 'write', 'delete'] },
              expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              created_at: new Date(),
            }],
          })
          .mockResolvedValueOnce(undefined), // COMMIT
        release: jest.fn(),
      };

      pool.connect.mockResolvedValueOnce(mockClient);

      const result = await ApiKeyService.createApiKey('user-456', 'Expiring Key', 30);

      expect(result.expires_at).toBeDefined();
      const insertCall = mockClient.query.mock.calls[2];
      expect(insertCall[1][6]).not.toBeNull(); // expires_at parameter
    });

    test('should rollback transaction on error', async () => {
      const mockClient = {
        query: jest.fn()
          .mockResolvedValueOnce(undefined) // BEGIN
          .mockResolvedValueOnce({ rows: [{ team_id: 'team-789' }] })
          .mockRejectedValueOnce(new Error('Database error')),
        release: jest.fn(),
      };

      pool.connect.mockResolvedValueOnce(mockClient);

      await expect(
        ApiKeyService.createApiKey('user-789', 'Failed Key', null)
      ).rejects.toThrow('Database error');

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });

    test('should throw error if user not found', async () => {
      const mockClient = {
        query: jest.fn()
          .mockResolvedValueOnce(undefined) // BEGIN
          .mockResolvedValueOnce({ rows: [] }), // No user found
        release: jest.fn(),
      };

      pool.connect.mockResolvedValueOnce(mockClient);

      await expect(
        ApiKeyService.createApiKey('nonexistent-user', 'Test Key', null)
      ).rejects.toThrow('User not found');

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    });

    test('should store only first 8 and last 4 chars as prefix', async () => {
      const mockClient = {
        query: jest.fn()
          .mockResolvedValueOnce(undefined) // BEGIN
          .mockResolvedValueOnce({ rows: [{ team_id: 'team-123' }] })
          .mockResolvedValueOnce({
            rows: [{
              id: 'apikey-111',
              name: 'Prefix Test',
              key_prefix: 'abcd1234...wxyz',
              scopes: { all: ['read', 'write', 'delete'] },
              expires_at: null,
              created_at: new Date(),
            }],
          })
          .mockResolvedValueOnce(undefined), // COMMIT
        release: jest.fn(),
      };

      pool.connect.mockResolvedValueOnce(mockClient);

      await ApiKeyService.createApiKey('user-111', 'Prefix Test', null);

      const insertParams = mockClient.query.mock.calls[2][1];
      const keyPrefix = insertParams[4];
      expect(keyPrefix).toMatch(/^.{8}\.\.\..{4}$/);
    });
  });

  describe('validateApiKey', () => {
    const mockApiKey = 'a'.repeat(64);
    const mockKeyHash = crypto.createHash('sha256').update(mockApiKey).digest('hex');

    test('should validate valid API key and return user data', async () => {
      const mockKeyData = {
        api_key_id: 'apikey-123',
        user_id: 'user-456',
        team_id: 'team-789',
        scopes: { all: ['read', 'write', 'delete'] },
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        is_active: true,
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        role: 'agent',
        user_is_active: true,
        team_name: 'Test Team',
      };

      pool.query
        .mockResolvedValueOnce({ rows: [mockKeyData] }) // SELECT query
        .mockResolvedValueOnce({ rows: [] }); // UPDATE last_used_at

      const result = await ApiKeyService.validateApiKey(mockApiKey);

      expect(result).toEqual({
        apiKeyId: 'apikey-123',
        userId: 'user-456',
        teamId: 'team-789',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'agent',
        teamName: 'Test Team',
        scopes: { all: ['read', 'write', 'delete'] },
      });

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        [mockKeyHash]
      );
    });

    test('should update last_used_at timestamp', async () => {
      const mockKeyData = {
        api_key_id: 'apikey-999',
        user_id: 'user-999',
        team_id: 'team-999',
        scopes: { all: ['read'] },
        expires_at: null,
        is_active: true,
        email: 'user@example.com',
        first_name: 'Jane',
        last_name: 'Smith',
        role: 'agent',
        user_is_active: true,
        team_name: 'Team 999',
      };

      pool.query
        .mockResolvedValueOnce({ rows: [mockKeyData] })
        .mockResolvedValueOnce({ rows: [] });

      await ApiKeyService.validateApiKey(mockApiKey);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE api_keys'),
        ['apikey-999']
      );
    });

    test('should return null for nonexistent API key', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await ApiKeyService.validateApiKey('nonexistent_key');

      expect(result).toBeNull();
    });

    test('should throw error for deactivated API key', async () => {
      const mockKeyData = {
        api_key_id: 'apikey-inactive',
        is_active: false,
        user_is_active: true,
      };

      pool.query.mockResolvedValueOnce({ rows: [mockKeyData] });

      await expect(
        ApiKeyService.validateApiKey(mockApiKey)
      ).rejects.toThrow('API key has been deactivated');
    });

    test('should throw error for deactivated user', async () => {
      const mockKeyData = {
        api_key_id: 'apikey-user-inactive',
        is_active: true,
        user_is_active: false,
      };

      pool.query.mockResolvedValueOnce({ rows: [mockKeyData] });

      await expect(
        ApiKeyService.validateApiKey(mockApiKey)
      ).rejects.toThrow('User account has been deactivated');
    });

    test('should throw error for expired API key', async () => {
      const mockKeyData = {
        api_key_id: 'apikey-expired',
        is_active: true,
        user_is_active: true,
        expires_at: new Date('2020-01-01'),
      };

      pool.query.mockResolvedValueOnce({ rows: [mockKeyData] });

      await expect(
        ApiKeyService.validateApiKey(mockApiKey)
      ).rejects.toThrow('API key has expired');
    });

    test('should use default scopes if scopes is null', async () => {
      const mockKeyData = {
        api_key_id: 'apikey-old',
        user_id: 'user-old',
        team_id: 'team-old',
        scopes: null,
        expires_at: null,
        is_active: true,
        email: 'old@example.com',
        first_name: 'Old',
        last_name: 'Key',
        role: 'agent',
        user_is_active: true,
        team_name: 'Old Team',
      };

      pool.query
        .mockResolvedValueOnce({ rows: [mockKeyData] })
        .mockResolvedValueOnce({ rows: [] });

      const result = await ApiKeyService.validateApiKey(mockApiKey);

      expect(result.scopes).toEqual({ all: ['read', 'write', 'delete'] });
    });
  });

  describe('listUserApiKeys', () => {
    test('should return all API keys for user', async () => {
      const mockKeys = [
        {
          id: 'apikey-1',
          name: 'Production Key',
          key_prefix: 'abcd1234...wxyz',
          scopes: { all: ['read', 'write', 'delete'] },
          last_used_at: new Date(),
          expires_at: null,
          is_active: true,
          created_at: new Date(),
        },
        {
          id: 'apikey-2',
          name: 'Development Key',
          key_prefix: 'efgh5678...stuv',
          scopes: { all: ['read'] },
          last_used_at: null,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          is_active: true,
          created_at: new Date(),
        },
      ];

      pool.query.mockResolvedValueOnce({ rows: mockKeys });

      const result = await ApiKeyService.listUserApiKeys('user-123');

      expect(result).toEqual(mockKeys);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        ['user-123']
      );
    });

    test('should return empty array if user has no keys', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await ApiKeyService.listUserApiKeys('user-no-keys');

      expect(result).toEqual([]);
    });

    test('should order keys by created_at DESC', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      await ApiKeyService.listUserApiKeys('user-123');

      const query = pool.query.mock.calls[0][0];
      expect(query).toContain('ORDER BY created_at DESC');
    });
  });

  describe('revokeApiKey', () => {
    test('should revoke API key successfully', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ id: 'apikey-123' }] });

      const result = await ApiKeyService.revokeApiKey('user-123', 'apikey-123');

      expect(result).toEqual({
        success: true,
        message: 'API key revoked successfully',
      });

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE api_keys'),
        ['apikey-123', 'user-123']
      );
    });

    test('should set is_active to false', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ id: 'apikey-456' }] });

      await ApiKeyService.revokeApiKey('user-456', 'apikey-456');

      const query = pool.query.mock.calls[0][0];
      expect(query).toContain('is_active = false');
    });

    test('should throw error if API key not found', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      await expect(
        ApiKeyService.revokeApiKey('user-789', 'nonexistent-key')
      ).rejects.toThrow('API key not found or you do not have permission to revoke it');
    });

    test('should prevent revoking another user\'s key', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] }); // No rows returned (wrong user_id)

      await expect(
        ApiKeyService.revokeApiKey('user-wrong', 'apikey-123')
      ).rejects.toThrow('API key not found or you do not have permission to revoke it');
    });
  });

  describe('deleteApiKey', () => {
    test('should delete API key permanently', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ id: 'apikey-delete' }] });

      const result = await ApiKeyService.deleteApiKey('user-delete', 'apikey-delete');

      expect(result).toEqual({
        success: true,
        message: 'API key deleted successfully',
      });

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM api_keys'),
        ['apikey-delete', 'user-delete']
      );
    });

    test('should throw error if API key not found', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      await expect(
        ApiKeyService.deleteApiKey('user-123', 'nonexistent-key')
      ).rejects.toThrow('API key not found or you do not have permission to delete it');
    });

    test('should prevent deleting another user\'s key', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      await expect(
        ApiKeyService.deleteApiKey('user-wrong', 'apikey-123')
      ).rejects.toThrow('API key not found or you do not have permission to delete it');
    });
  });

  describe('logApiKeyUsage', () => {
    test('should log API key usage', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      await ApiKeyService.logApiKeyUsage(
        'apikey-123',
        '/v1/escrows',
        'GET',
        200,
        '192.168.1.1',
        'Mozilla/5.0'
      );

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO api_key_logs'),
        ['apikey-123', '/v1/escrows', 'GET', 200, '192.168.1.1', 'Mozilla/5.0']
      );
    });

    test('should handle logging errors gracefully', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      // Should not throw
      await expect(
        ApiKeyService.logApiKeyUsage('apikey-fail', '/test', 'POST', 500, '1.1.1.1', 'Test')
      ).resolves.toBeUndefined();

      expect(console.error).toHaveBeenCalledWith(
        'Failed to log API key usage:',
        expect.any(Error)
      );
    });
  });
});
