const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const RefreshTokenService = require('../services/refreshToken.service');
const SecurityEventService = require('../services/securityEvent.service');

// JWT Secret Configuration (matches auth.middleware.js)
// MUST be set in environment - no fallback for security
if (!process.env.JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is required');
}

const jwtSecret = process.env.JWT_SECRET;

// JWT expiry from environment or defaults
const jwtAccessExpiry = process.env.JWT_ACCESS_TOKEN_EXPIRY || '15m';
const jwtRefreshExpiry = process.env.JWT_REFRESH_TOKEN_EXPIRY || '7d';

class AuthController {
  /**
   * Test endpoint
   */
  static async register(req, res) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const { email, password, firstName, lastName, role = 'agent' } = req.body;
      
      // Validate input
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_FIELDS',
            message: 'Email, password, first name, and last name are required'
          }
        });
      }
      
      // Check if user already exists
      const existingUser = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [email.toLowerCase()]
      );
      
      if (existingUser.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          error: {
            code: 'USER_EXISTS',
            message: 'User with this email already exists'
          }
        });
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      
      // Create user
      const createUserQuery = `
        INSERT INTO users (
          email, password_hash, first_name, last_name, role, 
          is_active, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())
        RETURNING id, email, first_name, last_name, role, is_active
      `;
      
      const result = await client.query(createUserQuery, [
        email.toLowerCase(),
        passwordHash,
        firstName,
        lastName,
        role
      ]);
      
      const user = result.rows[0];

      // Generate JWT token
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role
        },
        jwtSecret,
        { expiresIn: jwtAccessExpiry }
      );
      
      await client.query('COMMIT');
      
      res.status(201).json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            role: user.role,
            isActive: user.is_active
          },
          token
        },
        message: 'User registered successfully'
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'REGISTRATION_ERROR',
          message: 'Failed to register user'
        }
      });
    } finally {
      client.release();
    }
  }

  /**
   * Login user
   */
  static async login(req, res) {
    try {
      // Accept both username and email fields for compatibility
      const { email, username, password } = req.body;
      const loginEmail = email || username;
      
      // Validate input
      if (!loginEmail || !password) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_CREDENTIALS',
            message: 'Username/email and password are required'
          }
        });
      }
      
      // Get user by email OR username (include lockout fields)
      const userQuery = `
        SELECT id, email, username, password_hash, first_name, last_name, role, is_active,
               failed_login_attempts, locked_until
        FROM users
        WHERE LOWER(email) = LOWER($1) OR LOWER(username) = LOWER($1)
      `;

      const userResult = await pool.query(userQuery, [loginEmail]);

      if (userResult.rows.length === 0) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password'
          }
        });
      }

      const user = userResult.rows[0];

      // Check if user is active
      if (!user.is_active) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'ACCOUNT_DISABLED',
            message: 'Your account has been disabled'
          }
        });
      }

      // Check if account is locked
      if (user.locked_until && new Date(user.locked_until) > new Date()) {
        const minutesLeft = Math.ceil((new Date(user.locked_until) - new Date()) / 60000);

        // Log attempt to access locked account (fire-and-forget)
        SecurityEventService.logLockedAccountAttempt(req, user, minutesLeft).catch(console.error);

        return res.status(423).json({
          success: false,
          error: {
            code: 'ACCOUNT_LOCKED',
            message: `Account temporarily locked due to too many failed login attempts. Try again in ${minutesLeft} minute${minutesLeft !== 1 ? 's' : ''}.`,
            locked_until: user.locked_until
          }
        });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);

      if (!isPasswordValid) {
        // Increment failed attempts and lock if threshold reached
        const updateResult = await pool.query(`
          UPDATE users
          SET
            failed_login_attempts = failed_login_attempts + 1,
            locked_until = CASE
              WHEN failed_login_attempts >= 4 THEN NOW() + INTERVAL '30 minutes'
              ELSE NULL
            END
          WHERE id = $1
          RETURNING failed_login_attempts, locked_until
        `, [user.id]);

        const updatedUser = updateResult.rows[0];

        // Log failed login attempt (fire-and-forget, don't await)
        SecurityEventService.logLoginFailed(req, loginEmail, 'Invalid credentials').catch(console.error);

        // If account was just locked, log that event (fire-and-forget)
        if (updatedUser.locked_until) {
          SecurityEventService.logAccountLocked(
            req,
            user,
            updatedUser.locked_until,
            updatedUser.failed_login_attempts
          ).catch(console.error);
        }

        return res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password'
          }
        });
      }

      // Successful login - reset failed attempts and update last login
      await pool.query(`
        UPDATE users
        SET
          last_login = NOW(),
          failed_login_attempts = 0,
          locked_until = NULL
        WHERE id = $1
      `, [user.id]);

      // Generate JWT access token
      const accessToken = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role
        },
        jwtSecret,
        { expiresIn: jwtAccessExpiry }
      );

      // Create refresh token with device info
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.headers['user-agent'] || 'Unknown';
      const deviceInfo = {
        browser: userAgent,
        ip: ipAddress
      };

      const refreshToken = await RefreshTokenService.createRefreshToken(
        user.id,
        ipAddress,
        userAgent,
        deviceInfo
      );

      // Log successful login (fire-and-forget)
      SecurityEventService.logLoginSuccess(req, user).catch(console.error);

      // Set refresh token as httpOnly cookie
      res.cookie('refreshToken', refreshToken.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax', // Changed from 'strict' - allows top-level navigation (email links, OAuth) while preventing CSRF
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            firstName: user.first_name,
            lastName: user.last_name,
            role: user.role,
            isActive: user.is_active
          },
          token: accessToken, // Keep 'token' for backward compatibility
          accessToken,
          refreshToken: refreshToken.token, // For mobile apps that can't use cookies
          expiresIn: jwtAccessExpiry,
          tokenType: 'Bearer'
        },
        message: 'Login successful'
      });
      
    } catch (error) {
      console.error('Login error:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });

      // Return detailed error for debugging
      res.status(500).json({
        success: false,
        error: {
          code: 'LOGIN_ERROR',
          message: 'Failed to login',
          details: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }
      });
    }
  }

  /**
   * Get current user profile
   */
  static async getProfile(req, res) {
    try {
      // User is already authenticated via middleware
      const userId = req.user.id;
      
      const userQuery = `
        SELECT id, email, username, first_name, last_name, role, is_active, 
               last_login, created_at, updated_at
        FROM users
        WHERE id = $1
      `;
      
      const userResult = await pool.query(userQuery, [userId]);
      
      if (userResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found'
          }
        });
      }
      
      const user = userResult.rows[0];
      
      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            firstName: user.first_name,
            lastName: user.last_name,
            role: user.role,
            isActive: user.is_active,
            lastLogin: user.last_login,
            createdAt: user.created_at,
            updatedAt: user.updated_at
          }
        }
      });
      
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'PROFILE_ERROR',
          message: 'Failed to get profile'
        }
      });
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(req, res) {
    const client = await pool.connect();
    
    try {
      const userId = req.user.id;
      const {
        firstName,
        lastName,
        currentPassword,
        newPassword,
        homeCity,
        homeState,
        homeZip,
        homeLat,
        homeLng,
        licensedStates,
        searchRadiusMiles
      } = req.body;
      
      const updates = [];
      const values = [];
      let paramIndex = 1;
      
      // Build update fields
      if (firstName) {
        updates.push(`first_name = $${paramIndex}`);
        values.push(firstName);
        paramIndex++;
      }
      
      if (lastName) {
        updates.push(`last_name = $${paramIndex}`);
        values.push(lastName);
        paramIndex++;
      }

      // Location preferences
      if (homeCity) {
        updates.push(`home_city = $${paramIndex}`);
        values.push(homeCity);
        paramIndex++;
      }

      if (homeState) {
        updates.push(`home_state = $${paramIndex}`);
        values.push(homeState);
        paramIndex++;
      }

      if (homeZip) {
        updates.push(`home_zip = $${paramIndex}`);
        values.push(homeZip);
        paramIndex++;
      }

      if (homeLat !== undefined) {
        updates.push(`home_lat = $${paramIndex}`);
        values.push(homeLat);
        paramIndex++;
      }

      if (homeLng !== undefined) {
        updates.push(`home_lng = $${paramIndex}`);
        values.push(homeLng);
        paramIndex++;
      }

      if (licensedStates) {
        updates.push(`licensed_states = $${paramIndex}`);
        values.push(licensedStates);
        paramIndex++;
      }

      if (searchRadiusMiles !== undefined) {
        updates.push(`search_radius_miles = $${paramIndex}`);
        values.push(searchRadiusMiles);
        paramIndex++;
      }

      // Handle password change
      if (newPassword) {
        if (!currentPassword) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'MISSING_CURRENT_PASSWORD',
              message: 'Current password is required to change password'
            }
          });
        }
        
        // Verify current password
        const userResult = await client.query(
          'SELECT password_hash FROM users WHERE id = $1',
          [userId]
        );
        
        const isPasswordValid = await bcrypt.compare(
          currentPassword, 
          userResult.rows[0].password_hash
        );
        
        if (!isPasswordValid) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'INVALID_CURRENT_PASSWORD',
              message: 'Current password is incorrect'
            }
          });
        }
        
        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(newPassword, salt);
        
        updates.push(`password_hash = $${paramIndex}`);
        values.push(passwordHash);
        paramIndex++;
      }
      
      if (updates.length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'NO_UPDATES',
            message: 'No fields to update'
          }
        });
      }
      
      // Add updated_at
      updates.push(`updated_at = NOW()`);
      values.push(userId);
      
      const updateQuery = `
        UPDATE users
        SET ${updates.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING id, email, first_name, last_name, role, is_active,
                  home_city, home_state, home_zip, home_lat, home_lng,
                  licensed_states, search_radius_miles
      `;
      
      const result = await client.query(updateQuery, values);
      const user = result.rows[0];
      
      res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          isActive: user.is_active,
          home_city: user.home_city,
          home_state: user.home_state,
          home_zip: user.home_zip,
          home_lat: user.home_lat,
          home_lng: user.home_lng,
          licensed_states: user.licensed_states,
          search_radius_miles: user.search_radius_miles
        },
        message: 'Profile updated successfully'
      });
      
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: 'Failed to update profile'
        }
      });
    } finally {
      client.release();
    }
  }

  /**
   * Refresh access token using refresh token
   * POST /auth/refresh
   */
  static async refresh(req, res) {
    try {
      // Support both cookie and body for mobile apps
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'NO_REFRESH_TOKEN',
            message: 'No refresh token provided'
          }
        });
      }

      // Validate refresh token
      const tokenData = await RefreshTokenService.validateRefreshToken(refreshToken);

      if (!tokenData) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_REFRESH_TOKEN',
            message: 'Invalid or expired refresh token'
          }
        });
      }

      // Generate new access token
      const accessToken = jwt.sign(
        {
          id: tokenData.id,
          email: tokenData.email,
          role: tokenData.role
        },
        jwtSecret,
        { expiresIn: jwtAccessExpiry }
      );

      // Optional: Rotate refresh token for enhanced security
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.headers['user-agent'] || 'Unknown';

      const newRefreshToken = await RefreshTokenService.rotateRefreshToken(
        refreshToken,
        tokenData.id,
        ipAddress,
        userAgent
      );

      // Update cookie with new refresh token
      res.cookie('refreshToken', newRefreshToken.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      // Log token refresh (fire-and-forget)
      SecurityEventService.logTokenRefresh(req, tokenData).catch(console.error);

      res.json({
        success: true,
        data: {
          accessToken,
          expiresIn: jwtAccessExpiry
        }
      });

    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'REFRESH_ERROR',
          message: 'Failed to refresh token'
        }
      });
    }
  }

  /**
   * Logout - revoke current refresh token
   * POST /auth/logout
   */
  static async logout(req, res) {
    try {
      // Support both cookie and body for mobile apps
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

      if (refreshToken) {
        await RefreshTokenService.revokeRefreshToken(refreshToken);
      }

      // Clear refresh token cookie
      res.clearCookie('refreshToken');

      res.json({
        success: true,
        message: 'Logged out successfully'
      });

    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'LOGOUT_ERROR',
          message: 'Failed to logout'
        }
      });
    }
  }

  /**
   * Logout from all devices - revoke all user refresh tokens
   * POST /auth/logout-all
   * Requires authentication
   */
  static async logoutAll(req, res) {
    try {
      const userId = req.user.id;

      await RefreshTokenService.revokeAllUserTokens(userId);

      // Clear refresh token cookie
      res.clearCookie('refreshToken');

      res.json({
        success: true,
        message: 'Logged out from all devices successfully'
      });

    } catch (error) {
      console.error('Logout all error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'LOGOUT_ALL_ERROR',
          message: 'Failed to logout from all devices'
        }
      });
    }
  }

  /**
   * Get active sessions for current user
   * GET /auth/sessions
   * Requires authentication
   */
  static async getSessions(req, res) {
    try {
      const userId = req.user.id;

      const sessions = await RefreshTokenService.getUserTokens(userId);

      res.json({
        success: true,
        data: {
          sessions: sessions.map(session => ({
            id: session.id,
            createdAt: session.created_at,
            expiresAt: session.expires_at,
            ipAddress: session.ip_address,
            userAgent: session.user_agent,
            deviceInfo: session.device_info,
            isCurrent: req.cookies.refreshToken === session.token
          }))
        }
      });

    } catch (error) {
      console.error('Get sessions error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_SESSIONS_ERROR',
          message: 'Failed to retrieve sessions'
        }
      });
    }
  }
}

module.exports = AuthController;