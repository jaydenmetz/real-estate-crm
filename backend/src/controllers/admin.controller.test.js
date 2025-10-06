const { pool } = require('../config/database');
const AdminController = require('./admin.controller');

// Mock database
jest.mock('../config/database');

describe('AdminController', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock authenticated request (admin user)
    mockReq = {
      user: {
        id: 'admin-123',
        email: 'admin@example.com',
        role: 'system_admin',
      },
      body: {},
      query: {},
      params: {},
    };

    // Setup mock response
    mockRes = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
  });

  describe('getDatabaseStats (GET /admin/stats)', () => {
    it('should return counts for all 26 database tables', async () => {
      // Arrange
      pool.query.mockResolvedValue({ rows: [{ count: '42' }] });

      // Act
      await AdminController.getDatabaseStats(mockReq, mockRes);

      // Assert
      expect(pool.query).toHaveBeenCalledTimes(26); // One query per table
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          users: 42,
          escrows: 42,
          listings: 42,
          clients: 42,
          appointments: 42,
          leads: 42,
        }),
      });
    });

    it('should handle database errors gracefully', async () => {
      // Arrange
      pool.query.mockRejectedValue(new Error('Database connection failed'));

      // Act
      await AdminController.getDatabaseStats(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'DATABASE_STATS_ERROR',
          message: 'Failed to fetch database statistics',
        },
      });
    });
  });

  describe('getAllUsers (GET /admin/users)', () => {
    it('should return all users with safe fields only', async () => {
      // Arrange
      const mockUsers = [
        {
          id: 'user-1',
          username: 'agent1',
          email: 'agent1@example.com',
          first_name: 'John',
          last_name: 'Doe',
          role: 'agent',
          is_active: true,
          last_login: '2025-01-01T12:00:00Z',
          created_at: '2024-01-01T00:00:00Z',
        },
        {
          id: 'user-2',
          username: 'broker1',
          email: 'broker1@example.com',
          first_name: 'Jane',
          last_name: 'Smith',
          role: 'broker',
          is_active: true,
          last_login: '2025-01-02T12:00:00Z',
          created_at: '2024-01-02T00:00:00Z',
        },
      ];

      pool.query.mockResolvedValue({ rows: mockUsers });

      // Act
      await AdminController.getAllUsers(mockReq, mockRes);

      // Assert
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id, username, email'),
      );
      expect(pool.query).toHaveBeenCalledWith(
        expect.not.stringContaining('password_hash'),
      );
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockUsers,
      });
    });

    it('should handle database errors', async () => {
      // Arrange
      pool.query.mockRejectedValue(new Error('Query failed'));

      // Act
      await AdminController.getAllUsers(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: expect.objectContaining({
          code: 'GET_USERS_ERROR',
        }),
      });
    });
  });

  describe('getUserById (GET /admin/users/:id)', () => {
    it('should return specific user by ID', async () => {
      // Arrange
      mockReq.params = { id: 'user-123' };
      const mockUser = {
        id: 'user-123',
        username: 'agent1',
        email: 'agent1@example.com',
        role: 'agent',
        is_active: true,
      };

      pool.query.mockResolvedValue({ rows: [mockUser] });

      // Act
      await AdminController.getUserById(mockReq, mockRes);

      // Assert
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE id = $1'),
        ['user-123'],
      );
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockUser,
      });
    });

    it('should return 404 if user not found', async () => {
      // Arrange
      mockReq.params = { id: 'nonexistent' };
      pool.query.mockResolvedValue({ rows: [] });

      // Act
      await AdminController.getUserById(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: expect.objectContaining({
          code: 'USER_NOT_FOUND',
        }),
      });
    });
  });

  describe('updateUser (PUT /admin/users/:id)', () => {
    it('should update user fields', async () => {
      // Arrange
      mockReq.params = { id: 'user-123' };
      mockReq.body = {
        first_name: 'Updated',
        last_name: 'Name',
        role: 'broker',
        is_active: false,
      };

      const updatedUser = {
        id: 'user-123',
        first_name: 'Updated',
        last_name: 'Name',
        role: 'broker',
        is_active: false,
      };

      pool.query.mockResolvedValue({ rows: [updatedUser] });

      // Act
      await AdminController.updateUser(mockReq, mockRes);

      // Assert
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE users'),
        expect.arrayContaining(['user-123']),
      );
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: updatedUser,
      });
    });

    it('should prevent updating password_hash directly', async () => {
      // Arrange
      mockReq.params = { id: 'user-123' };
      mockReq.body = {
        password_hash: 'malicious-hash', // Should be ignored/rejected
        role: 'system_admin',
      };

      // Act
      await AdminController.updateUser(mockReq, mockRes);

      // Assert
      expect(pool.query).toHaveBeenCalledWith(
        expect.not.stringContaining('password_hash'),
        expect.any(Array),
      );
    });
  });

  describe('deleteUser (DELETE /admin/users/:id)', () => {
    it('should soft delete user by setting is_active to false', async () => {
      // Arrange
      mockReq.params = { id: 'user-123' };
      pool.query.mockResolvedValue({ rows: [{ id: 'user-123', is_active: false }] });

      // Act
      await AdminController.deleteUser(mockReq, mockRes);

      // Assert
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE users SET is_active = false'),
        ['user-123'],
      );
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          message: expect.stringContaining('deactivated'),
        }),
      });
    });

    it('should return 404 if user not found', async () => {
      // Arrange
      mockReq.params = { id: 'nonexistent' };
      pool.query.mockResolvedValue({ rows: [] });

      // Act
      await AdminController.deleteUser(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: expect.objectContaining({
          code: 'USER_NOT_FOUND',
        }),
      });
    });
  });

  describe('getSystemHealth (GET /admin/health)', () => {
    it('should return database connection status', async () => {
      // Arrange
      pool.query.mockResolvedValue({
        rows: [{ now: '2025-01-01T12:00:00Z', version: 'PostgreSQL 14.5' }],
      });

      // Act
      await AdminController.getSystemHealth(mockReq, mockRes);

      // Assert
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT NOW()'),
      );
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          database: 'connected',
        }),
      });
    });

    it('should return unhealthy status if database fails', async () => {
      // Arrange
      pool.query.mockRejectedValue(new Error('Connection timeout'));

      // Act
      await AdminController.getSystemHealth(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(503);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        data: expect.objectContaining({
          database: 'disconnected',
        }),
      });
    });
  });

  describe('Security Tests', () => {
    it('should not expose password_hash in any response', async () => {
      // Arrange
      const mockUserWithPassword = {
        id: 'user-123',
        email: 'test@example.com',
        password_hash: 'secret-hash', // Should never be returned
      };

      pool.query.mockResolvedValue({ rows: [mockUserWithPassword] });

      // Act
      await AdminController.getAllUsers(mockReq, mockRes);

      // Assert
      const responseData = mockRes.json.mock.calls[0][0];
      expect(JSON.stringify(responseData)).not.toContain('password_hash');
      expect(JSON.stringify(responseData)).not.toContain('secret-hash');
    });

    it('should validate admin role for sensitive operations', async () => {
      // Arrange
      mockReq.user.role = 'agent'; // Non-admin trying to access admin endpoint

      // Act
      await AdminController.deleteUser(mockReq, mockRes);

      // Assert
      // Note: This test assumes role-based authorization middleware
      // If not implemented, this test documents the security requirement
      expect(mockRes.status).toHaveBeenCalledWith(403);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty result sets gracefully', async () => {
      // Arrange
      pool.query.mockResolvedValue({ rows: [] });

      // Act
      await AdminController.getAllUsers(mockReq, mockRes);

      // Assert
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: [],
      });
    });

    it('should handle SQL injection attempts safely', async () => {
      // Arrange
      mockReq.params = { id: "1' OR '1'='1" }; // SQL injection attempt

      // Act
      await AdminController.getUserById(mockReq, mockRes);

      // Assert
      // Parameterized queries should prevent injection
      expect(pool.query).toHaveBeenCalledWith(
        expect.any(String),
        ["1' OR '1'='1"], // Should be passed as parameter, not concatenated
      );
    });

    it('should handle concurrent database operations', async () => {
      // Arrange
      pool.query.mockResolvedValue({ rows: [{ count: '100' }] });

      // Act
      await Promise.all([
        AdminController.getDatabaseStats(mockReq, mockRes),
        AdminController.getDatabaseStats(mockReq, mockRes),
        AdminController.getDatabaseStats(mockReq, mockRes),
      ]);

      // Assert
      expect(pool.query).toHaveBeenCalledTimes(26 * 3); // 26 tables * 3 concurrent requests
    });
  });
});

module.exports = AdminController;
