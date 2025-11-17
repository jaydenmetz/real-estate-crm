/**
 * Auth Service (Module Level)
 *
 * Business logic for authentication workflows specific to this module.
 * Complements lib/auth services (which handle tokens, API keys, OAuth).
 *
 * This service handles:
 * - Login/registration workflows
 * - Password management
 * - Session management
 *
 * Extracted from auth.controller.js for DDD compliance.
 */

const { pool } = require('../../../../config/infrastructure/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const refreshTokenService = require('../../../../lib/auth/refreshToken.service');

/**
 * Login user
 * @param {Object} credentials - Login credentials
 * @returns {Promise<Object>} Auth tokens and user info
 */
exports.login = async (credentials) => {
  const { email, password } = credentials;

  // Find user
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL',
    [email]
  );

  if (result.rows.length === 0) {
    const error = new Error('Invalid credentials');
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  const user = result.rows[0];

  // Check password
  const isValid = await bcrypt.compare(password, user.password_hash);

  if (!isValid) {
    const error = new Error('Invalid credentials');
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  // Check account status
  if (user.status === 'suspended') {
    const error = new Error('Account suspended');
    error.code = 'ACCOUNT_SUSPENDED';
    throw error;
  }

  // Generate tokens
  const accessToken = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      team_id: user.team_id
    },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = await refreshTokenService.generateRefreshToken(user.id);

  // Update last login
  await pool.query(
    'UPDATE users SET last_login = NOW() WHERE id = $1',
    [user.id]
  );

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      team_id: user.team_id
    }
  };
};

/**
 * Register new user
 * @param {Object} userData - Registration data
 * @returns {Promise<Object>} Created user (without password)
 */
exports.register = async (userData) => {
  const {
    email,
    password,
    username,
    first_name,
    last_name,
    team_id
  } = userData;

  // Check if email already exists
  const existing = await pool.query(
    'SELECT id FROM users WHERE email = $1',
    [email]
  );

  if (existing.rows.length > 0) {
    const error = new Error('Email already registered');
    error.code = 'EMAIL_EXISTS';
    throw error;
  }

  // Hash password
  const password_hash = await bcrypt.hash(password, 12);

  // Create user
  const id = uuidv4();

  const result = await pool.query(
    `INSERT INTO users (
      id,
      email,
      password_hash,
      username,
      first_name,
      last_name,
      team_id,
      role,
      status,
      created_at,
      updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'user', 'active', NOW(), NOW())
    RETURNING id, email, username, first_name, last_name, role, team_id, created_at`,
    [id, email, password_hash, username, first_name, last_name, team_id]
  );

  return result.rows[0];
};

/**
 * Change password
 * @param {string} userId - User ID
 * @param {Object} passwords - Old and new passwords
 * @returns {Promise<void>}
 */
exports.changePassword = async (userId, passwords) => {
  const { oldPassword, newPassword } = passwords;

  // Get user
  const result = await pool.query(
    'SELECT password_hash FROM users WHERE id = $1 AND deleted_at IS NULL',
    [userId]
  );

  if (result.rows.length === 0) {
    const error = new Error('User not found');
    error.code = 'NOT_FOUND';
    throw error;
  }

  const user = result.rows[0];

  // Verify old password
  const isValid = await bcrypt.compare(oldPassword, user.password_hash);

  if (!isValid) {
    const error = new Error('Invalid current password');
    error.code = 'INVALID_PASSWORD';
    throw error;
  }

  // Hash new password
  const newPasswordHash = await bcrypt.hash(newPassword, 12);

  // Update password
  await pool.query(
    'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
    [newPasswordHash, userId]
  );
};

/**
 * Request password reset
 * @param {string} email - User email
 * @returns {Promise<string>} Reset token
 */
exports.requestPasswordReset = async (email) => {
  // Find user
  const result = await pool.query(
    'SELECT id FROM users WHERE email = $1 AND deleted_at IS NULL',
    [email]
  );

  if (result.rows.length === 0) {
    // Don't reveal if email exists
    return null;
  }

  const user = result.rows[0];

  // Generate reset token
  const resetToken = uuidv4();
  const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

  await pool.query(
    'UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3',
    [resetToken, resetTokenExpiry, user.id]
  );

  return resetToken;
};

/**
 * Reset password with token
 * @param {string} token - Reset token
 * @param {string} newPassword - New password
 * @returns {Promise<void>}
 */
exports.resetPassword = async (token, newPassword) => {
  // Find user with valid token
  const result = await pool.query(
    `SELECT id FROM users
     WHERE reset_token = $1
       AND reset_token_expiry > NOW()
       AND deleted_at IS NULL`,
    [token]
  );

  if (result.rows.length === 0) {
    const error = new Error('Invalid or expired reset token');
    error.code = 'INVALID_TOKEN';
    throw error;
  }

  const user = result.rows[0];

  // Hash new password
  const passwordHash = await bcrypt.hash(newPassword, 12);

  // Update password and clear reset token
  await pool.query(
    `UPDATE users
     SET password_hash = $1,
         reset_token = NULL,
         reset_token_expiry = NULL,
         updated_at = NOW()
     WHERE id = $2`,
    [passwordHash, user.id]
  );
};

/**
 * Logout (invalidate refresh tokens)
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
exports.logout = async (userId) => {
  await refreshTokenService.revokeAllTokens(userId);
};
