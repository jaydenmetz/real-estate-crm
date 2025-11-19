const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../../../../config/infrastructure/database');
const RefreshTokenService = require('../../../../lib/auth/refreshToken.service');
const SecurityEventService = require('../../../../lib/security/securityEvent.service');
const EmailService = require('../../../../lib/communication/email.service');
const GeoAnomalyService = require('../../../../lib/security/geoAnomaly.service');
const OnboardingService = require('../../onboarding/services/onboarding.service');
const GoogleOAuthService = require('../../../../lib/auth/googleOAuth.service');

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

      const {
        email, password, firstName, lastName, username, role = 'agent',
      } = req.body;

      // Validate input
      if (!email || !password || !firstName || !lastName || !username) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_FIELDS',
            message: 'Email, password, first name, last name, and username are required',
          },
        });
      }

      // Convert username to lowercase
      const usernameLower = username.toLowerCase();

      // Check if user already exists (by email or username)
      const existingUser = await client.query(
        'SELECT id FROM users WHERE LOWER(email) = LOWER($1) OR LOWER(username) = LOWER($2)',
        [email, usernameLower],
      );

      if (existingUser.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          error: {
            code: 'USER_EXISTS',
            message: 'User with this email or username already exists',
          },
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Create user
      const createUserQuery = `
        INSERT INTO users (
          email, username, password_hash, first_name, last_name, role,
          is_active, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), NOW())
        RETURNING id, email, username, first_name, last_name, role, is_active
      `;

      const result = await client.query(createUserQuery, [
        email.toLowerCase(),
        usernameLower,
        passwordHash,
        firstName,
        lastName,
        role,
      ]);

      const user = result.rows[0];

      // Generate JWT token
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        jwtSecret,
        { expiresIn: jwtAccessExpiry },
      );

      await client.query('COMMIT');

      // Generate sample data and initialize onboarding (async, don't block response)
      OnboardingService.generateSampleData(user.id)
        .then(() => {
          // // console.log(`✅ Sample data generated for user ${user.id}`)
        })
        .catch((err) => {
          // console.error(`❌ Failed to generate sample data for user ${user.id}:`, err)
        });

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            role: user.role,
            isActive: user.is_active,
          },
          token,
          onboarding: {
            sampleDataGenerated: true,
            tutorialAvailable: true,
            nextStep: '/onboarding/welcome',
          },
        },
        message: 'User registered successfully',
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'REGISTRATION_ERROR',
          message: 'Failed to register user',
        },
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
            message: 'Username/email and password are required',
          },
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
            message: 'Invalid email or password',
          },
        });
      }

      const user = userResult.rows[0];

      // Check if user is active
      if (!user.is_active) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'ACCOUNT_DISABLED',
            message: 'Your account has been disabled',
          },
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
            locked_until: user.locked_until,
          },
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

        // If account was just locked, log that event and send email alert (fire-and-forget)
        if (updatedUser.locked_until) {
          SecurityEventService.logAccountLocked(
            req,
            user,
            updatedUser.locked_until,
            updatedUser.failed_login_attempts,
          ).catch(console.error);

          // Send email alert (fire-and-forget)
          const minutesLocked = Math.ceil((new Date(updatedUser.locked_until) - new Date()) / 60000);
          EmailService.sendAccountLockoutAlert({
            to: user.email,
            name: user.first_name,
            failedAttempts: updatedUser.failed_login_attempts,
            ipAddress: req.ip || req.connection?.remoteAddress || 'Unknown',
            lockedUntil: new Date(updatedUser.locked_until).toLocaleString(),
            minutesLocked,
          }).catch(console.error);
        }

        return res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password',
          },
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
          role: user.role,
        },
        jwtSecret,
        { expiresIn: jwtAccessExpiry },
      );

      // Create refresh token with device info (wrapped in try/catch to prevent blocking)
      let refreshTokenData = null;
      try {
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.headers['user-agent'] || 'Unknown';
        const deviceInfo = {
          browser: userAgent,
          ip: ipAddress,
        };

        // CRITICAL: Revoke old tokens from this device to prevent accumulation
        // Uses device fingerprint (IP + user agent) to distinguish sessions
        // This prevents 21+ tokens per user when they log in after token expiry
        await RefreshTokenService.revokeOldTokensFromDevice(user.id, userAgent, ipAddress);

        refreshTokenData = await RefreshTokenService.createRefreshToken(
          user.id,
          ipAddress,
          userAgent,
          deviceInfo,
        );

        // Set refresh token as httpOnly cookie (30 days sliding window)
        const expiryDays = parseInt(process.env.JWT_REFRESH_TOKEN_EXPIRY_DAYS || '30');
        res.cookie('refreshToken', refreshTokenData.token, {
          httpOnly: true,
          secure: true, // Always use HTTPS (production is always HTTPS)
          sameSite: 'lax', // Same-site navigation allowed (crm.jaydenmetz.com → api.jaydenmetz.com share root domain)
          domain: '.jaydenmetz.com',
          maxAge: expiryDays * 24 * 60 * 60 * 1000,
        });
      } catch (refreshTokenError) {
        console.error('Failed to create refresh token (non-fatal):', refreshTokenError);
        // Continue with login even if refresh token fails
      }

      // Log successful login (fire-and-forget pattern)
      // Note: .catch() handles async errors, try/catch handles sync errors
      // If logging fails, login still succeeds (graceful degradation)
      try {
        SecurityEventService.logLoginSuccess(req, user).catch(console.error);

        // Check for geographic anomalies (fire-and-forget)
        GeoAnomalyService.logLoginWithGeo(req, user).catch(console.error);
      } catch (logError) {
        console.error('Failed to log security event (non-fatal):', logError);
      }

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
          },
          token: accessToken, // Keep 'token' for backward compatibility
          accessToken,
          refreshToken: refreshTokenData?.token, // For mobile apps that can't use cookies
          expiresIn: jwtAccessExpiry,
          tokenType: 'Bearer',
        },
        message: 'Login successful',
      });
    } catch (error) {
      console.error('Login error:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });

      // Return error response
      res.status(500).json({
        success: false,
        error: {
          code: 'LOGIN_ERROR',
          message: 'Failed to login',
          details: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        },
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
               last_login, created_at, updated_at, timezone
        FROM users
        WHERE id = $1
      `;

      const userResult = await pool.query(userQuery, [userId]);

      if (userResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          },
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
            updatedAt: user.updated_at,
            timezone: user.timezone || 'America/Los_Angeles',
          },
        },
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'PROFILE_ERROR',
          message: 'Failed to get profile',
        },
      });
    }
  }

  /**
   * PHASE 3.5: Verify user role (server-side)
   * This endpoint checks if the authenticated user has the required role
   * Cannot be bypassed by modifying localStorage (uses JWT token)
   */
  static async verifyRole(req, res) {
    try {
      const { requiredRole } = req.query;

      // req.user comes from JWT token (verified by authenticate middleware)
      // This is SERVER data, not client localStorage
      const userRole = req.user.role;

      // Handle role as array (e.g., ['system_admin', 'agent'])
      const roles = Array.isArray(userRole) ? userRole : [userRole];
      const authorized = roles.includes(requiredRole);

      // Log for security audit
      // // console.log(`[Role Verification] User ${req.user.email} (${userRole}) attempting to access role: ${requiredRole} → ${authorized ? 'GRANTED' : 'DENIED'}`);

      res.json({
        success: true,
        data: {
          authorized,
          userRole,
          requiredRole,
          userId: req.user.id,
          email: req.user.email,
        },
      });
    } catch (error) {
      console.error('Verify role error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'ROLE_VERIFICATION_ERROR',
          message: 'Failed to verify role',
        },
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
        searchRadiusMiles,
        timezone,
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

      if (timezone) {
        updates.push(`timezone = $${paramIndex}`);
        values.push(timezone);
        paramIndex++;
      }

      // Handle password change
      if (newPassword) {
        if (!currentPassword) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'MISSING_CURRENT_PASSWORD',
              message: 'Current password is required to change password',
            },
          });
        }

        // Verify current password
        const userResult = await client.query(
          'SELECT password_hash FROM users WHERE id = $1',
          [userId],
        );

        const isPasswordValid = await bcrypt.compare(
          currentPassword,
          userResult.rows[0].password_hash,
        );

        if (!isPasswordValid) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'INVALID_CURRENT_PASSWORD',
              message: 'Current password is incorrect',
            },
          });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(newPassword, salt);

        updates.push(`password_hash = $${paramIndex}`);
        values.push(passwordHash);
        paramIndex++;

        // Log password change (fire-and-forget)
        SecurityEventService.logEvent({
          eventType: 'password_changed',
          eventCategory: 'account',
          severity: 'warning',
          userId: req.user.id,
          email: req.user.email,
          username: req.user.username,
          ipAddress: req.ip || req.connection?.remoteAddress,
          userAgent: req.headers['user-agent'],
          requestPath: req.originalUrl,
          requestMethod: req.method,
          success: true,
          message: 'User password changed',
        }).catch(console.error);
      }

      if (updates.length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'NO_UPDATES',
            message: 'No fields to update',
          },
        });
      }

      // Add updated_at
      updates.push('updated_at = NOW()');
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
          search_radius_miles: user.search_radius_miles,
        },
        message: 'Profile updated successfully',
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: 'Failed to update profile',
        },
      });
    } finally {
      client.release();
    }
  }

  /**
   * Refresh access token using refresh token with sliding window
   * POST /auth/refresh
   * Implements sliding 30-day window with preserved absolute 90-day limit
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
            message: 'No refresh token provided',
          },
        });
      }

      // Validate refresh token (checks both expires_at and absolute_expires_at)
      const tokenData = await RefreshTokenService.validateRefreshToken(refreshToken);

      if (!tokenData) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_REFRESH_TOKEN',
            message: 'Invalid or expired refresh token',
          },
        });
      }

      // Generate new access token
      const accessToken = jwt.sign(
        {
          id: tokenData.user_id,
          email: tokenData.email,
          role: tokenData.role,
        },
        jwtSecret,
        { expiresIn: jwtAccessExpiry },
      );

      // Rotate refresh token with sliding window (30 days from now)
      // CRITICAL: Pass absolute_expires_at from old token to preserve hard limit
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.headers['user-agent'] || 'Unknown';

      const newRefreshToken = await RefreshTokenService.rotateRefreshToken(
        refreshToken,
        tokenData.user_id,
        ipAddress,
        userAgent,
        tokenData.absolute_expires_at, // Preserve original absolute expiry
      );

      // Update cookie with new refresh token (30 days for sliding window)
      const expiryDays = parseInt(process.env.JWT_REFRESH_TOKEN_EXPIRY_DAYS || '30');
      res.cookie('refreshToken', newRefreshToken.token, {
        httpOnly: true,
        secure: true, // Always use HTTPS (production is always HTTPS)
        sameSite: 'lax', // Same-site navigation allowed (crm.jaydenmetz.com → api.jaydenmetz.com share root domain)
        domain: '.jaydenmetz.com',
        maxAge: expiryDays * 24 * 60 * 60 * 1000,
      });

      // Log token refresh (fire-and-forget)
      SecurityEventService.logTokenRefresh(req, tokenData).catch(console.error);

      res.json({
        success: true,
        data: {
          accessToken,
          expiresIn: jwtAccessExpiry,
          refreshTokenExpiresIn: `${expiryDays}d`, // Sliding window
        },
      });
    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'REFRESH_ERROR',
          message: 'Failed to refresh token',
        },
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

      // Log logout event (fire-and-forget)
      if (req.user) {
        SecurityEventService.logEvent({
          eventType: 'logout',
          eventCategory: 'authentication',
          severity: 'info',
          userId: req.user.id,
          email: req.user.email,
          username: req.user.username,
          ipAddress: req.ip || req.connection?.remoteAddress,
          userAgent: req.headers['user-agent'],
          requestPath: req.originalUrl,
          requestMethod: req.method,
          success: true,
          message: 'User logged out successfully',
        }).catch(console.error);
      }

      // Clear refresh token cookie
      res.clearCookie('refreshToken');

      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'LOGOUT_ERROR',
          message: 'Failed to logout',
        },
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
        message: 'Logged out from all devices successfully',
      });
    } catch (error) {
      console.error('Logout all error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'LOGOUT_ALL_ERROR',
          message: 'Failed to logout from all devices',
        },
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
          sessions: sessions.map((session) => ({
            id: session.id,
            createdAt: session.created_at,
            expiresAt: session.expires_at,
            ipAddress: session.ip_address,
            userAgent: session.user_agent,
            deviceInfo: session.device_info,
            isCurrent: req.cookies.refreshToken === session.token,
          })),
        },
      });
    } catch (error) {
      console.error('Get sessions error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_SESSIONS_ERROR',
          message: 'Failed to retrieve sessions',
        },
      });
    }
  }

  /**
   * Google OAuth Sign-In
   */
  static async googleSignIn(req, res) {
    try {
      const { idToken } = req.body;

      if (!idToken) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_ID_TOKEN',
            message: 'Google ID token is required',
          },
        });
      }

      // Verify Google token and sign in/register user
      const result = await GoogleOAuthService.signInWithGoogle(idToken);

      // Create refresh token
      const refreshToken = await RefreshTokenService.createToken(
        result.user.id,
        req.ip,
        req.get('user-agent'),
      );

      // Set httpOnly cookie for refresh token (30 days sliding window)
      const expiryDays = parseInt(process.env.JWT_REFRESH_TOKEN_EXPIRY_DAYS || '30');
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true, // Always use HTTPS (production is always HTTPS)
        sameSite: 'lax', // Same-site navigation allowed (crm.jaydenmetz.com → api.jaydenmetz.com share root domain)
        domain: '.jaydenmetz.com',
        maxAge: expiryDays * 24 * 60 * 60 * 1000,
      });

      // Log successful login via Google
      SecurityEventService.logEvent({
        eventType: 'login_success',
        eventCategory: 'authentication',
        severity: 'info',
        userId: result.user.id,
        email: result.user.email,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        requestPath: req.path,
        requestMethod: req.method,
        success: true,
        message: 'User logged in successfully via Google OAuth',
        metadata: {
          authMethod: 'google_oauth',
        },
      }).catch(console.error);

      res.json({
        success: true,
        data: {
          token: result.token,
          user: result.user,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Google sign-in error:', error);

      // Log failed Google login
      SecurityEventService.logEvent({
        eventType: 'login_failed',
        eventCategory: 'authentication',
        severity: 'warning',
        email: req.body.email || 'unknown',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        requestPath: req.path,
        requestMethod: req.method,
        success: false,
        message: `Google OAuth login failed: ${error.message}`,
        metadata: {
          authMethod: 'google_oauth',
          errorMessage: error.message,
        },
      }).catch(console.error);

      res.status(401).json({
        success: false,
        error: {
          code: 'GOOGLE_AUTH_ERROR',
          message: error.message || 'Google authentication failed',
        },
      });
    }
  }

  /**
   * Check username availability
   */
  static async checkUsername(req, res) {
    try {
      const { username } = req.params;

      // Validate username format
      if (!username || username.length < 4 || username.length > 20) {
        return res.json({
          success: true,
          data: {
            available: false,
            message: 'Username must be 4-20 characters',
          },
        });
      }

      // Check if username matches required pattern (accept uppercase, will convert to lowercase)
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return res.json({
          success: true,
          data: {
            available: false,
            message: 'Username can only contain letters, numbers, and underscores',
          },
        });
      }

      // Check if username exists
      const result = await pool.query(
        'SELECT id FROM users WHERE LOWER(username) = LOWER($1)',
        [username],
      );

      const available = result.rows.length === 0;

      res.json({
        success: true,
        data: {
          available,
          username,
          message: available ? 'Username is available' : 'Username is already taken',
        },
      });
    } catch (error) {
      console.error('Check username error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'CHECK_USERNAME_ERROR',
          message: 'Failed to check username availability',
        },
      });
    }
  }

  /**
   * Cleanup expired refresh tokens
   * Endpoint for cron jobs or scheduled tasks to prevent database bloat
   * No authentication required - can be called by Railway cron or external scheduler
   */
  static async cleanupExpiredTokens(req, res) {
    try {
      const deletedCount = await RefreshTokenService.cleanupExpiredTokens();

      res.json({
        success: true,
        data: {
          deletedCount,
          message: `Cleaned up ${deletedCount} expired refresh tokens`,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Token cleanup error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'CLEANUP_ERROR',
          message: 'Failed to cleanup expired tokens',
        },
      });
    }
  }
}

module.exports = AuthController;
