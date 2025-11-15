const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../../../../config/database');
const RefreshTokenService = require('../../../../services/refreshToken.service');
const SecurityEventService = require('../../../../services/securityEvent.service');
const AuthController = require('../controllers/auth.controller');

// Mock dependencies
jest.mock('../../../../config/database');
jest.mock('../../../../services/refreshToken.service');
jest.mock('../../../../services/securityEvent.service');

describe('AuthController', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock request
    mockReq = {
      body: {},
      ip: '127.0.0.1',
      headers: { 'user-agent': 'Jest Test Suite' },
      connection: { remoteAddress: '127.0.0.1' },
    };

    // Setup mock response
    mockRes = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
    };
  });

  describe('login', () => {
    // TEST 1: Successful login with valid credentials
    it('should login successfully with valid credentials and return JWT + refresh token', async () => {
      // Arrange
      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        username: 'testuser',
        password_hash: await bcrypt.hash('ValidPassword123!', 10),
        first_name: 'Test',
        last_name: 'User',
        role: 'agent',
        is_active: true,
        failed_login_attempts: 0,
        locked_until: null,
      };

      pool.query.mockResolvedValueOnce({ rows: [mockUser] }); // User lookup
      pool.query.mockResolvedValueOnce({ rows: [mockUser] }); // Reset failed attempts

      RefreshTokenService.createRefreshToken.mockResolvedValue({
        token: 'refresh-token-abc123',
      });

      SecurityEventService.logLoginSuccess.mockResolvedValue();

      mockReq.body = {
        email: 'test@example.com',
        password: 'ValidPassword123!',
      };

      // Act
      await AuthController.login(mockReq, mockRes);

      // Assert
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            user: expect.objectContaining({
              email: 'test@example.com',
              firstName: 'Test',
              lastName: 'User',
            }),
            token: expect.any(String),
            accessToken: expect.any(String),
            expiresIn: '15m',
          }),
        }),
      );

      expect(mockRes.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'refresh-token-abc123',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
        }),
      );

      expect(SecurityEventService.logLoginSuccess).toHaveBeenCalled();
    });

    // TEST 2: Failed login with wrong password
    it('should fail login with invalid password and increment failed attempts', async () => {
      // Arrange
      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        password_hash: await bcrypt.hash('CorrectPassword123!', 10),
        failed_login_attempts: 2,
        locked_until: null,
        is_active: true,
      };

      pool.query.mockResolvedValueOnce({ rows: [mockUser] }); // User lookup
      pool.query.mockResolvedValueOnce({
        rows: [{ failed_login_attempts: 3, locked_until: null }],
      }); // Increment failed attempts

      SecurityEventService.logLoginFailed.mockResolvedValue();

      mockReq.body = {
        email: 'test@example.com',
        password: 'WrongPassword!',
      };

      // Act
      await AuthController.login(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password',
          }),
        }),
      );

      expect(SecurityEventService.logLoginFailed).toHaveBeenCalledWith(
        mockReq,
        'test@example.com',
        'Invalid credentials',
      );
    });

    // TEST 3: Account lockout after 5 failed attempts
    it('should lock account after 5th failed login attempt', async () => {
      // Arrange
      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        password_hash: await bcrypt.hash('CorrectPassword123!', 10),
        failed_login_attempts: 4, // One more attempt will lock
        locked_until: null,
        is_active: true,
      };

      const lockedUntil = new Date(Date.now() + 30 * 60 * 1000);

      pool.query.mockResolvedValueOnce({ rows: [mockUser] }); // User lookup
      pool.query.mockResolvedValueOnce({
        rows: [{ failed_login_attempts: 5, locked_until: lockedUntil }],
      }); // Lock account

      SecurityEventService.logLoginFailed.mockResolvedValue();
      SecurityEventService.logAccountLocked.mockResolvedValue();

      mockReq.body = {
        email: 'test@example.com',
        password: 'WrongPassword!',
      };

      // Act
      await AuthController.login(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(SecurityEventService.logAccountLocked).toHaveBeenCalled();
    });

    // TEST 4: Reject login when account is locked
    it('should reject login attempt when account is locked', async () => {
      // Arrange
      const lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 min from now
      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        password_hash: await bcrypt.hash('ValidPassword123!', 10),
        failed_login_attempts: 5,
        locked_until: lockedUntil,
        is_active: true,
        first_name: 'Test',
        last_name: 'User',
      };

      pool.query.mockResolvedValueOnce({ rows: [mockUser] });

      SecurityEventService.logLockedAccountAttempt.mockResolvedValue();

      mockReq.body = {
        email: 'test@example.com',
        password: 'ValidPassword123!', // Even correct password rejected
      };

      // Act
      await AuthController.login(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(423); // 423 Locked
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'ACCOUNT_LOCKED',
          }),
        }),
      );

      expect(SecurityEventService.logLockedAccountAttempt).toHaveBeenCalled();
    });

    // TEST 5: Reject login for inactive account
    it('should reject login for disabled/inactive account', async () => {
      // Arrange
      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        password_hash: await bcrypt.hash('ValidPassword123!', 10),
        is_active: false, // Account disabled
        failed_login_attempts: 0,
        locked_until: null,
      };

      pool.query.mockResolvedValueOnce({ rows: [mockUser] });

      mockReq.body = {
        email: 'test@example.com',
        password: 'ValidPassword123!',
      };

      // Act
      await AuthController.login(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'ACCOUNT_DISABLED',
          }),
        }),
      );
    });

    // TEST 6: Handle missing credentials
    it('should return error when email or password is missing', async () => {
      // Arrange
      mockReq.body = {
        email: 'test@example.com',
        // password missing
      };

      // Act
      await AuthController.login(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'MISSING_CREDENTIALS',
          }),
        }),
      );
    });

    // TEST 7: Handle non-existent user
    it('should return generic error for non-existent user (security)', async () => {
      // Arrange
      pool.query.mockResolvedValueOnce({ rows: [] }); // User not found

      mockReq.body = {
        email: 'nonexistent@example.com',
        password: 'SomePassword123!',
      };

      // Act
      await AuthController.login(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password', // Generic message (don't reveal user existence)
          }),
        }),
      );
    });
  });

  describe('register', () => {
    // TEST 8: Successful user registration
    it('should register new user successfully and return JWT', async () => {
      // Arrange
      pool.connect = jest.fn().mockResolvedValue({
        query: jest.fn()
          .mockResolvedValueOnce({ rows: [] }) // No existing user
          .mockResolvedValueOnce({
            rows: [{
              id: '123e4567-e89b-12d3-a456-426614174000',
              email: 'newuser@example.com',
              first_name: 'New',
              last_name: 'User',
              role: 'agent',
              is_active: true,
            }],
          }), // Create user
        release: jest.fn(),
      });

      mockReq.body = {
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        firstName: 'New',
        lastName: 'User',
      };

      // Act
      await AuthController.register(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            user: expect.objectContaining({
              email: 'newuser@example.com',
            }),
            token: expect.any(String),
          }),
        }),
      );
    });

    // TEST 9: Reject duplicate email registration
    it('should reject registration with duplicate email', async () => {
      // Arrange
      pool.connect = jest.fn().mockResolvedValue({
        query: jest.fn()
          .mockResolvedValueOnce({
            rows: [{ id: 'existing-user-id' }],
          }), // User already exists
        release: jest.fn(),
      });

      mockReq.body = {
        email: 'existing@example.com',
        password: 'SecurePass123!',
        firstName: 'Test',
        lastName: 'User',
      };

      // Act
      await AuthController.register(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'USER_EXISTS',
            message: 'User with this email already exists',
          }),
        }),
      );
    });

    // TEST 10: Validate required fields on registration
    it('should reject registration with missing required fields', async () => {
      // Arrange
      pool.connect = jest.fn().mockResolvedValue({
        query: jest.fn(),
        release: jest.fn(),
      });

      mockReq.body = {
        email: 'test@example.com',
        // missing password, firstName, lastName
      };

      // Act
      await AuthController.register(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'MISSING_FIELDS',
          }),
        }),
      );
    });
  });
});
