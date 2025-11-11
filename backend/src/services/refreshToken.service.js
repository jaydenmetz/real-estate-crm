const crypto = require('crypto');
const { pool } = require('../config/database');
const logger = require('../utils/logger');
const IpGeolocationService = require('./ipGeolocation.service');

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

      // Set sliding expiration (30 days from now for CRM use case)
      const expiresAt = new Date();
      const expiryDays = parseInt(process.env.JWT_REFRESH_TOKEN_EXPIRY_DAYS || '30');
      expiresAt.setDate(expiresAt.getDate() + expiryDays);

      // Set absolute maximum expiration (90 days from now - hard limit)
      const absoluteExpiresAt = new Date();
      const absoluteExpiryDays = parseInt(process.env.JWT_REFRESH_TOKEN_ABSOLUTE_EXPIRY_DAYS || '90');
      absoluteExpiresAt.setDate(absoluteExpiresAt.getDate() + absoluteExpiryDays);

      // Get location from IP address (fire-and-forget to avoid blocking login)
      let location = null;
      try {
        location = await IpGeolocationService.getLocationCached(ipAddress);
      } catch (geoError) {
        logger.warn('Failed to get IP geolocation (non-fatal):', geoError);
      }

      const query = `
        INSERT INTO refresh_tokens (
          user_id, token, expires_at, absolute_expires_at, ip_address, user_agent, device_info,
          location_city, location_region, location_country, location_lat, location_lng, location_timezone
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *
      `;

      const result = await pool.query(query, [
        userId,
        token,
        expiresAt,
        absoluteExpiresAt,
        ipAddress,
        userAgent,
        deviceInfo,
        location?.city,
        location?.region,
        location?.country,
        location?.lat,
        location?.lng,
        location?.timezone,
      ]);

      logger.info('Refresh token created', {
        userId,
        tokenId: result.rows[0].id,
        expiresAt,
        absoluteExpiresAt,
        location: location ? `${location.city}, ${location.region}` : 'Unknown',
      });

      return result.rows[0];
    } catch (error) {
      logger.error('Error creating refresh token:', error);
      throw new Error('Failed to create refresh token');
    }
  }

  /**
   * Validate a refresh token and return user data
   * Checks both sliding expiry and absolute expiry
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
          AND rt.expires_at > NOW()
          AND rt.absolute_expires_at > NOW()
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
   * Delete a specific refresh token (logout)
   * Token is DELETED (not revoked) since security_events tracks all auth activity
   * @param {string} token - Refresh token to delete
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  static async revokeRefreshToken(token) {
    try {
      const query = `
        DELETE FROM refresh_tokens
        WHERE token = $1
        RETURNING id
      `;

      const result = await pool.query(query, [token]);

      if (result.rows.length > 0) {
        logger.info('Refresh token deleted (logout)', { tokenId: result.rows[0].id });
        return true;
      }

      return false;
    } catch (error) {
      logger.error('Error deleting refresh token:', error);
      throw new Error('Failed to delete refresh token');
    }
  }

  /**
   * Delete all refresh tokens for a user (logout from all devices)
   * Tokens are DELETED (not revoked) since security_events tracks all auth activity
   * @param {string} userId - User UUID
   * @returns {Promise<number>} Number of tokens deleted
   */
  static async revokeAllUserTokens(userId) {
    try {
      const query = `
        DELETE FROM refresh_tokens
        WHERE user_id = $1
        RETURNING id
      `;

      const result = await pool.query(query, [userId]);

      logger.info('All user tokens deleted (logout all devices)', {
        userId,
        count: result.rowCount,
      });

      return result.rowCount;
    } catch (error) {
      logger.error('Error deleting all user tokens:', error);
      throw new Error('Failed to delete all user tokens');
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
   * Deletes tokens that expired (to prevent database bloat)
   * Run daily to keep refresh_tokens table lean
   * @returns {Promise<number>} Number of tokens deleted
   */
  static async cleanupExpiredTokens() {
    try {
      const query = `
        DELETE FROM refresh_tokens
        WHERE expires_at < NOW()
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
          COUNT(*) FILTER (WHERE expires_at > NOW()) as active_tokens,
          COUNT(*) FILTER (WHERE expires_at <= NOW()) as expired_tokens,
          COUNT(DISTINCT user_id) FILTER (WHERE expires_at > NOW()) as active_users
        FROM refresh_tokens
      `;

      const result = await pool.query(query);
      return result.rows[0];
    } catch (error) {
      logger.error('Error getting token stats:', error);
      return {
        active_tokens: 0,
        expired_tokens: 0,
        active_users: 0,
      };
    }
  }

  /**
   * Rotate refresh token with sliding window (create new one, delete old one)
   * Implements sliding 30-day window while preserving absolute expiry
   * Old token is DELETED (not revoked) since security_events already tracks everything
   * @param {string} oldToken - Old token to delete
   * @param {string} userId - User ID
   * @param {string} ipAddress - Client IP
   * @param {string} userAgent - Client user agent
   * @param {Date} absoluteExpiresAt - Original absolute expiry from old token (preserved)
   * @returns {Promise<object>} New token data
   */
  static async rotateRefreshToken(oldToken, userId, ipAddress, userAgent, absoluteExpiresAt) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // DELETE old token (not revoke) - security_events table tracks all auth activity
      await client.query(
        'DELETE FROM refresh_tokens WHERE token = $1',
        [oldToken],
      );

      // Create new token
      const token = crypto.randomBytes(40).toString('hex');

      // Sliding window: Extend expires_at by 30 days from NOW
      const expiresAt = new Date();
      const expiryDays = parseInt(process.env.JWT_REFRESH_TOKEN_EXPIRY_DAYS || '30');
      expiresAt.setDate(expiresAt.getDate() + expiryDays);

      // CRITICAL: Preserve absolute_expires_at from original token
      // This ensures the token can NEVER live beyond 90 days from original creation
      // Even if user is active daily, they must re-login after 90 days for security
      const finalAbsoluteExpiresAt = absoluteExpiresAt || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

      // Get location from IP address
      let location = null;
      try {
        location = await IpGeolocationService.getLocationCached(ipAddress);
      } catch (geoError) {
        logger.warn('Failed to get IP geolocation during rotation (non-fatal):', geoError);
      }

      const insertQuery = `
        INSERT INTO refresh_tokens (
          user_id, token, expires_at, absolute_expires_at, ip_address, user_agent,
          location_city, location_region, location_country, location_lat, location_lng, location_timezone
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `;

      const result = await client.query(insertQuery, [
        userId,
        token,
        expiresAt,
        finalAbsoluteExpiresAt,
        ipAddress,
        userAgent,
        location?.city,
        location?.region,
        location?.country,
        location?.lat,
        location?.lng,
        location?.timezone,
      ]);

      await client.query('COMMIT');

      logger.info('Refresh token rotated with sliding window', {
        userId,
        newExpiresAt: expiresAt,
        absoluteExpiresAt: finalAbsoluteExpiresAt,
      });

      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error rotating refresh token:', error);
      throw new Error('Failed to rotate refresh token');
    } finally {
      client.release();
    }
  }

  /**
   * Revoke all existing refresh tokens for a user from the same device/browser
   * This prevents token accumulation when users log in multiple times without logging out
   * @param {string} userId - User UUID
   * @param {string} userAgent - Client user agent to match
   * @returns {Promise<number>} Number of tokens revoked
   */
  static async revokeOldTokensFromDevice(userId, userAgent) {
    try {
      const query = `
        DELETE FROM refresh_tokens
        WHERE user_id = $1
          AND user_agent = $2
          AND expires_at > NOW()
      `;

      const result = await pool.query(query, [userId, userAgent]);

      if (result.rowCount > 0) {
        logger.info('Revoked old refresh tokens from device', {
          userId,
          tokensRevoked: result.rowCount,
          userAgent: userAgent?.substring(0, 50), // Log truncated UA
        });
      }

      return result.rowCount;
    } catch (error) {
      logger.error('Error revoking old tokens from device:', error);
      // Non-fatal - continue with login even if cleanup fails
      return 0;
    }
  }
}

module.exports = RefreshTokenService;
