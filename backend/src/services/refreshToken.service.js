const crypto = require('crypto');
const { pool } = require('../config/database');
const logger = require('../utils/logger');

/**
 * Refresh Token Service
 * Manages long-lived refresh tokens for JWT authentication
 * Enables session revocation and logout functionality
 */
class RefreshTokenService {
  /**
   * Create a new refresh token for a user
   * @param {string} userId - User UUID
   * @param {string} ipAddress - Client IP address
   * @param {string} userAgent - Client user agent string
   * @param {object} deviceInfo - Optional device information
   * @returns {Promise<object>} Created refresh token data
   */
  static async createRefreshToken(userId, ipAddress, userAgent, deviceInfo = null) {
    try {
      // Generate cryptographically secure random token (80 characters)
      const token = crypto.randomBytes(40).toString('hex');

      // Set expiration (7 days from now, configurable via env)
      const expiresAt = new Date();
      const expiryDays = parseInt(process.env.JWT_REFRESH_TOKEN_EXPIRY_DAYS || '7');
      expiresAt.setDate(expiresAt.getDate() + expiryDays);

      const query = `
        INSERT INTO refresh_tokens (
          user_id, token, expires_at, ip_address, user_agent, device_info
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;

      const result = await pool.query(query, [
        userId,
        token,
        expiresAt,
        ipAddress,
        userAgent,
        deviceInfo,
      ]);

      logger.info('Refresh token created', {
        userId,
        tokenId: result.rows[0].id,
        expiresAt,
      });

      return result.rows[0];
    } catch (error) {
      logger.error('Error creating refresh token:', error);
      throw new Error('Failed to create refresh token');
    }
  }

  /**
   * Validate a refresh token and return user data
   * @param {string} token - Refresh token string
   * @returns {Promise<object|null>} User data if valid, null if invalid
   */
  static async validateRefreshToken(token) {
    try {
      const query = `
        SELECT
          rt.*,
          u.id as user_id,
          u.email,
          u.first_name,
          u.last_name,
          u.role,
          u.is_active,
          u.team_id
        FROM refresh_tokens rt
        JOIN users u ON rt.user_id = u.id
        WHERE rt.token = $1
          AND rt.revoked_at IS NULL
          AND rt.expires_at > NOW()
          AND u.is_active = true
      `;

      const result = await pool.query(query, [token]);

      if (result.rows.length === 0) {
        logger.warn('Invalid or expired refresh token used', { token: `${token.substring(0, 10)}...` });
        return null;
      }

      return result.rows[0];
    } catch (error) {
      logger.error('Error validating refresh token:', error);
      return null;
    }
  }

  /**
   * Revoke a specific refresh token (logout)
   * @param {string} token - Refresh token to revoke
   * @returns {Promise<boolean>} True if revoked, false if not found
   */
  static async revokeRefreshToken(token) {
    try {
      const query = `
        UPDATE refresh_tokens
        SET revoked_at = NOW()
        WHERE token = $1 AND revoked_at IS NULL
        RETURNING id
      `;

      const result = await pool.query(query, [token]);

      if (result.rows.length > 0) {
        logger.info('Refresh token revoked', { tokenId: result.rows[0].id });
        return true;
      }

      return false;
    } catch (error) {
      logger.error('Error revoking refresh token:', error);
      throw new Error('Failed to revoke refresh token');
    }
  }

  /**
   * Revoke all refresh tokens for a user (logout from all devices)
   * @param {string} userId - User UUID
   * @returns {Promise<number>} Number of tokens revoked
   */
  static async revokeAllUserTokens(userId) {
    try {
      const query = `
        UPDATE refresh_tokens
        SET revoked_at = NOW()
        WHERE user_id = $1 AND revoked_at IS NULL
        RETURNING id
      `;

      const result = await pool.query(query, [userId]);

      logger.info('All user tokens revoked', {
        userId,
        count: result.rowCount,
      });

      return result.rowCount;
    } catch (error) {
      logger.error('Error revoking all user tokens:', error);
      throw new Error('Failed to revoke all user tokens');
    }
  }

  /**
   * Get active refresh tokens for a user
   * @param {string} userId - User UUID
   * @returns {Promise<Array>} List of active tokens
   */
  static async getUserTokens(userId) {
    try {
      const query = `
        SELECT
          id,
          created_at,
          expires_at,
          ip_address,
          user_agent,
          device_info
        FROM refresh_tokens
        WHERE user_id = $1
          AND revoked_at IS NULL
          AND expires_at > NOW()
        ORDER BY created_at DESC
      `;

      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      logger.error('Error getting user tokens:', error);
      return [];
    }
  }

  /**
   * Clean up expired tokens (should be run as a cron job)
   * Deletes tokens that expired more than 30 days ago
   * @returns {Promise<number>} Number of tokens deleted
   */
  static async cleanupExpiredTokens() {
    try {
      const query = `
        DELETE FROM refresh_tokens
        WHERE expires_at < NOW() - INTERVAL '30 days'
        RETURNING id
      `;

      const result = await pool.query(query);

      if (result.rowCount > 0) {
        logger.info('Expired tokens cleaned up', { count: result.rowCount });
      }

      return result.rowCount;
    } catch (error) {
      logger.error('Error cleaning up expired tokens:', error);
      return 0;
    }
  }

  /**
   * Get token statistics for monitoring
   * @returns {Promise<object>} Token statistics
   */
  static async getTokenStats() {
    try {
      const query = `
        SELECT
          COUNT(*) FILTER (WHERE revoked_at IS NULL AND expires_at > NOW()) as active_tokens,
          COUNT(*) FILTER (WHERE expires_at <= NOW()) as expired_tokens,
          COUNT(*) FILTER (WHERE revoked_at IS NOT NULL) as revoked_tokens,
          COUNT(DISTINCT user_id) FILTER (WHERE revoked_at IS NULL AND expires_at > NOW()) as active_users
        FROM refresh_tokens
      `;

      const result = await pool.query(query);
      return result.rows[0];
    } catch (error) {
      logger.error('Error getting token stats:', error);
      return {
        active_tokens: 0,
        expired_tokens: 0,
        revoked_tokens: 0,
        active_users: 0,
      };
    }
  }

  /**
   * Rotate refresh token (create new one, revoke old one)
   * Useful for added security - tokens are rotated on use
   * @param {string} oldToken - Old token to revoke
   * @param {string} userId - User ID
   * @param {string} ipAddress - Client IP
   * @param {string} userAgent - Client user agent
   * @returns {Promise<object>} New token data
   */
  static async rotateRefreshToken(oldToken, userId, ipAddress, userAgent) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Revoke old token
      await client.query(
        'UPDATE refresh_tokens SET revoked_at = NOW() WHERE token = $1',
        [oldToken],
      );

      // Create new token
      const token = crypto.randomBytes(40).toString('hex');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const insertQuery = `
        INSERT INTO refresh_tokens (user_id, token, expires_at, ip_address, user_agent)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;

      const result = await client.query(insertQuery, [
        userId,
        token,
        expiresAt,
        ipAddress,
        userAgent,
      ]);

      await client.query('COMMIT');

      logger.info('Refresh token rotated', { userId });

      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error rotating refresh token:', error);
      throw new Error('Failed to rotate refresh token');
    } finally {
      client.release();
    }
  }
}

module.exports = RefreshTokenService;
