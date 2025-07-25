const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

class AuthController {
  /**
   * Test endpoint
   */
  static async test(req, res) {
    try {
      const result = await pool.query('SELECT NOW() as time, COUNT(*) as count FROM users');
      const adminResult = await pool.query(
        'SELECT id, email, is_active FROM users WHERE email = $1',
        ['admin@jaydenmetz.com']
      );
      
      res.json({
        success: true,
        data: {
          database: 'connected',
          time: result.rows[0].time,
          userCount: result.rows[0].count,
          jwtSecret: process.env.JWT_SECRET ? 'configured' : 'missing',
          nodeEnv: process.env.NODE_ENV || 'not set',
          adminUser: adminResult.rows.length > 0 ? {
            found: true,
            ...adminResult.rows[0]
          } : { found: false }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'TEST_ERROR',
          message: error.message
        }
      });
    }
  }

  /**
   * Debug login - completely raw response
   */
  static async debugLogin(req, res) {
    // Raw response, no error handling
    const { username, password } = req.body;
    
    res.setHeader('Content-Type', 'application/json');
    
    if (!username || !password) {
      res.end(JSON.stringify({
        error: 'Missing username or password',
        received: { username: !!username, password: !!password }
      }));
      return;
    }
    
    try {
      const result = await pool.query(
        'SELECT id, email, password_hash FROM users WHERE email = $1',
        [username]
      );
      
      if (result.rows.length === 0) {
        res.end(JSON.stringify({ error: 'User not found' }));
        return;
      }
      
      const user = result.rows[0];
      const validPassword = await bcrypt.compare(password, user.password_hash);
      
      if (!validPassword) {
        res.end(JSON.stringify({ error: 'Invalid password' }));
        return;
      }
      
      // Use a hardcoded secret for now
      const token = jwt.sign(
        { id: user.id, email: user.email },
        '69f1e69d189afcf71dbdba8b7fa4668566ba5491a',
        { expiresIn: '30d' }
      );
      
      res.end(JSON.stringify({
        success: true,
        token: token,
        user: { id: user.id, email: user.email }
      }));
      
    } catch (err) {
      res.end(JSON.stringify({
        error: 'Database error',
        details: err.message
      }));
    }
  }

  /**
   * Simple login for debugging
   */
  static async simpleLogin(req, res) {
    try {
      const { username, password } = req.body;
      
      // Debug logging
      console.log('Simple login attempt:', { username, hasPassword: !!password });
      
      // Direct query
      const result = await pool.query(
        'SELECT id, email, password_hash, first_name, last_name, role FROM users WHERE email = $1',
        [username]
      );
      
      if (result.rows.length === 0) {
        return res.json({ success: false, error: 'User not found', debugInfo: { username } });
      }
      
      const user = result.rows[0];
      console.log('User found:', user.email);
      
      const validPassword = await bcrypt.compare(password, user.password_hash);
      console.log('Password validation result:', validPassword);
      
      if (!validPassword) {
        return res.json({ success: false, error: 'Invalid password' });
      }
      
      // Generate token
      const jwtSecret = process.env.JWT_SECRET || '69f1e69d189afcf71dbdba8b7fa4668566ba5491a';
      console.log('Using JWT secret:', jwtSecret.substring(0, 10) + '...');
      
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        jwtSecret,
        { expiresIn: '30d' }
      );
      
      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            role: user.role
          },
          token
        }
      });
      
    } catch (error) {
      console.error('Simple login error:', error);
      res.json({
        success: false,
        error: error.message,
        stack: error.stack
      });
    }
  }

  /**
   * Register a new user
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
        process.env.JWT_SECRET || '69f1e69d189afcf71dbdba8b7fa4668566ba5491a',
        { expiresIn: process.env.JWT_EXPIRE || '30d' }
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
      
      // Get user by email
      const userQuery = `
        SELECT id, email, password_hash, first_name, last_name, role, is_active
        FROM users
        WHERE email = $1
      `;
      
      const userResult = await pool.query(userQuery, [loginEmail.toLowerCase()]);
      
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
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password'
          }
        });
      }
      
      // Update last login
      await pool.query(
        'UPDATE users SET last_login = NOW() WHERE id = $1',
        [user.id]
      );
      
      // Generate JWT token
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          role: user.role 
        },
        process.env.JWT_SECRET || '69f1e69d189afcf71dbdba8b7fa4668566ba5491a',
        { expiresIn: process.env.JWT_EXPIRE || '30d' }
      );
      
      res.json({
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
        message: 'Login successful'
      });
      
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'LOGIN_ERROR',
          message: 'Failed to login',
          details: error.message
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
        SELECT id, email, first_name, last_name, role, is_active, 
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
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          isActive: user.is_active,
          lastLogin: user.last_login,
          createdAt: user.created_at,
          updatedAt: user.updated_at
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
      const { firstName, lastName, currentPassword, newPassword } = req.body;
      
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
        RETURNING id, email, first_name, last_name, role, is_active
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
          isActive: user.is_active
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
   * Logout (optional - mainly for token blacklisting if implemented)
   */
  static async logout(req, res) {
    // In a stateless JWT system, logout is handled client-side
    // This endpoint can be used for token blacklisting if needed
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  }
}

module.exports = AuthController;