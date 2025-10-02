const crypto = require('crypto');
const { pool } = require('../config/database');

class ApiKeyService {
  /**
   * Generate a new API key
   * Format: 64 character random hex string
   */
  static generateApiKey() {
    const randomBytes = crypto.randomBytes(32).toString('hex');
    return randomBytes;
  }

  /**
   * Hash an API key for storage
   */
  static hashApiKey(apiKey) {
    return crypto.createHash('sha256').update(apiKey).digest('hex');
  }

  /**
   * Create a new API key for a user
   */
  static async createApiKey(userId, name, expiresInDays = null) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Get user's team_id
      const userResult = await client.query(
        'SELECT team_id FROM users WHERE id = $1',
        [userId],
      );

      if (userResult.rows.length === 0) {
        throw new Error('User not found');
      }

      const teamId = userResult.rows[0].team_id;

      // Generate new API key
      const apiKey = this.generateApiKey();
      const keyHash = this.hashApiKey(apiKey);
      const keyPrefix = `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`; // Store first 8 and last 4 chars for identification

      // Calculate expiration date if specified
      let expiresAt = null;
      if (expiresInDays) {
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expiresInDays);
      }

      // Default scopes: full access to all resources
      const defaultScopes = {
        all: ['read', 'write', 'delete'],
      };

      // Insert API key record
      const insertResult = await client.query(`
        INSERT INTO api_keys (
          user_id, team_id, name, key_hash, key_prefix, scopes, expires_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, name, key_prefix, scopes, expires_at, created_at
      `, [userId, teamId, name, keyHash, keyPrefix, JSON.stringify(defaultScopes), expiresAt]);

      await client.query('COMMIT');

      return {
        ...insertResult.rows[0],
        key: apiKey, // Return the full key only on creation
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Validate an API key and return user information
   */
  static async validateApiKey(apiKey) {
    const keyHash = this.hashApiKey(apiKey);

    const result = await pool.query(`
      SELECT
        ak.id as api_key_id,
        ak.user_id,
        ak.team_id,
        ak.scopes,
        ak.expires_at,
        ak.is_active,
        u.email,
        u.first_name,
        u.last_name,
        u.role,
        u.is_active as user_is_active,
        t.name as team_name
      FROM api_keys ak
      JOIN users u ON ak.user_id = u.id
      LEFT JOIN teams t ON ak.team_id = t.team_id
      WHERE ak.key_hash = $1
    `, [keyHash]);

    if (result.rows.length === 0) {
      return null;
    }

    const keyData = result.rows[0];

    // Check if key is active
    if (!keyData.is_active) {
      throw new Error('API key has been deactivated');
    }

    // Check if user is active
    if (!keyData.user_is_active) {
      throw new Error('User account has been deactivated');
    }

    // Check expiration
    if (keyData.expires_at && new Date(keyData.expires_at) < new Date()) {
      throw new Error('API key has expired');
    }

    // Update last used timestamp
    pool.query(`
      UPDATE api_keys 
      SET last_used_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [keyData.api_key_id]).catch(console.error);

    return {
      apiKeyId: keyData.api_key_id,
      userId: keyData.user_id,
      teamId: keyData.team_id,
      email: keyData.email,
      firstName: keyData.first_name,
      lastName: keyData.last_name,
      role: keyData.role,
      teamName: keyData.team_name,
      scopes: keyData.scopes || { all: ['read', 'write', 'delete'] }, // Fallback for old keys
    };
  }

  /**
   * List all API keys for a user
   */
  static async listUserApiKeys(userId) {
    const result = await pool.query(`
      SELECT
        id,
        name,
        key_prefix,
        scopes,
        last_used_at,
        expires_at,
        is_active,
        created_at
      FROM api_keys
      WHERE user_id = $1
      ORDER BY created_at DESC
    `, [userId]);

    return result.rows;
  }

  /**
   * Revoke an API key
   */
  static async revokeApiKey(userId, apiKeyId) {
    const result = await pool.query(`
      UPDATE api_keys
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND user_id = $2
      RETURNING id
    `, [apiKeyId, userId]);

    if (result.rows.length === 0) {
      throw new Error('API key not found or you do not have permission to revoke it');
    }

    return { success: true, message: 'API key revoked successfully' };
  }

  /**
   * Delete an API key
   */
  static async deleteApiKey(userId, apiKeyId) {
    const result = await pool.query(`
      DELETE FROM api_keys
      WHERE id = $1 AND user_id = $2
      RETURNING id
    `, [apiKeyId, userId]);

    if (result.rows.length === 0) {
      throw new Error('API key not found or you do not have permission to delete it');
    }

    return { success: true, message: 'API key deleted successfully' };
  }

  /**
   * Log API key usage
   */
  static async logApiKeyUsage(apiKeyId, endpoint, method, statusCode, ipAddress, userAgent) {
    try {
      await pool.query(`
        INSERT INTO api_key_logs (
          api_key_id, endpoint, method, status_code, ip_address, user_agent
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `, [apiKeyId, endpoint, method, statusCode, ipAddress, userAgent]);
    } catch (error) {
      console.error('Failed to log API key usage:', error);
    }
  }
}

module.exports = ApiKeyService;
