const pool = require('../config/database');

class AdminController {
  /**
   * Get database statistics
   */
  static async getDatabaseStats(req, res) {
    try {
      const stats = {};

      // Query count for each table
      const tables = [
        'users', 'api_keys', 'security_events', 'refresh_tokens', 'audit_logs',
        'escrows', 'listings', 'clients', 'appointments', 'leads',
        'brokers', 'onboarding_progress'
      ];

      for (const table of tables) {
        const result = await pool.query(`SELECT COUNT(*) FROM ${table}`);
        stats[table] = parseInt(result.rows[0].count);
      }

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Database stats error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'DATABASE_STATS_ERROR',
          message: 'Failed to fetch database statistics'
        }
      });
    }
  }

  /**
   * Get all users
   */
  static async getAllUsers(req, res) {
    try {
      const result = await pool.query(`
        SELECT id, username, email, first_name, last_name, role, is_active, last_login, created_at
        FROM users
        ORDER BY created_at DESC
      `);

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_USERS_ERROR',
          message: 'Failed to fetch users'
        }
      });
    }
  }

  /**
   * Get all API keys
   */
  static async getAllApiKeys(req, res) {
    try {
      const result = await pool.query(`
        SELECT
          ak.id, ak.name, ak.is_active, ak.last_used_at, ak.expires_at, ak.created_at,
          u.email as user_email
        FROM api_keys ak
        LEFT JOIN users u ON ak.user_id = u.id
        ORDER BY ak.created_at DESC
      `);

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Get API keys error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_API_KEYS_ERROR',
          message: 'Failed to fetch API keys'
        }
      });
    }
  }

  /**
   * Get security events
   */
  static async getSecurityEvents(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 100;

      const result = await pool.query(`
        SELECT id, event_type, event_category, severity, email, ip_address, success, message, created_at
        FROM security_events
        ORDER BY created_at DESC
        LIMIT $1
      `, [limit]);

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Get security events error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_SECURITY_EVENTS_ERROR',
          message: 'Failed to fetch security events'
        }
      });
    }
  }

  /**
   * Get refresh tokens
   */
  static async getRefreshTokens(req, res) {
    try {
      const result = await pool.query(`
        SELECT
          rt.id, rt.ip_address, rt.user_agent, rt.expires_at, rt.created_at,
          u.email as user_email
        FROM refresh_tokens rt
        LEFT JOIN users u ON rt.user_id = u.id
        WHERE rt.expires_at > NOW()
        ORDER BY rt.created_at DESC
      `);

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Get refresh tokens error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_REFRESH_TOKENS_ERROR',
          message: 'Failed to fetch refresh tokens'
        }
      });
    }
  }

  /**
   * Get audit logs
   */
  static async getAuditLogs(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 100;

      const result = await pool.query(`
        SELECT
          al.id, al.action, al.table_name, al.record_id, al.changes, al.created_at,
          u.email as user_email
        FROM audit_logs al
        LEFT JOIN users u ON al.user_id = u.id
        ORDER BY al.created_at DESC
        LIMIT $1
      `, [limit]);

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Get audit logs error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_AUDIT_LOGS_ERROR',
          message: 'Failed to fetch audit logs'
        }
      });
    }
  }
}

module.exports = AdminController;
