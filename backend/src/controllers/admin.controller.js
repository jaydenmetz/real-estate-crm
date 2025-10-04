const pool = require('../config/database');

class AdminController {
  /**
   * Get database statistics
   */
  static async getDatabaseStats(req, res) {
    try {
      const stats = {};

      // Query count for each table (all 26 tables)
      const tables = [
        'api_key_logs', 'api_keys', 'appointments', 'audit_log', 'audit_logs',
        'broker_profiles', 'broker_teams', 'broker_users', 'brokers', 'clients',
        'contacts', 'document_templates', 'documents', 'escrows', 'generated_documents',
        'leads', 'listing_price_history', 'listing_showings', 'listings', 'migrations',
        'onboarding_progress', 'refresh_tokens', 'security_events', 'teams',
        'user_profiles', 'users'
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

  /**
   * Get table data with pagination
   */
  static async getTableData(req, res) {
    try {
      const { tableName } = req.params;
      const limit = parseInt(req.query.limit) || 100;
      const offset = parseInt(req.query.offset) || 0;

      // Whitelist of allowed tables to prevent SQL injection
      const allowedTables = [
        'api_key_logs', 'api_keys', 'appointments', 'audit_log', 'audit_logs',
        'broker_profiles', 'broker_teams', 'broker_users', 'brokers', 'clients',
        'contacts', 'document_templates', 'documents', 'escrows', 'generated_documents',
        'leads', 'listing_price_history', 'listing_showings', 'listings', 'migrations',
        'onboarding_progress', 'refresh_tokens', 'security_events', 'teams',
        'user_profiles', 'users'
      ];

      if (!allowedTables.includes(tableName)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_TABLE',
            message: 'Invalid table name'
          }
        });
      }

      // Get total count
      const countResult = await pool.query(`SELECT COUNT(*) FROM ${tableName}`);
      const totalCount = parseInt(countResult.rows[0].count);

      // Get column information
      const columnsResult = await pool.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = $1 AND table_schema = 'public'
        ORDER BY ordinal_position
      `, [tableName]);

      const columns = columnsResult.rows.map(col => ({
        name: col.column_name,
        type: col.data_type
      }));

      // Get data with pagination
      const dataResult = await pool.query(`
        SELECT * FROM ${tableName}
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2
      `, [limit, offset]);

      res.json({
        success: true,
        data: {
          tableName,
          columns,
          rows: dataResult.rows,
          totalCount,
          limit,
          offset
        }
      });
    } catch (error) {
      console.error('Get table data error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_TABLE_DATA_ERROR',
          message: 'Failed to fetch table data'
        }
      });
    }
  }

  /**
   * Delete rows from table
   */
  static async deleteRows(req, res) {
    try {
      const { tableName } = req.params;
      const { ids } = req.body; // Array of IDs to delete

      // Whitelist validation
      const allowedTables = [
        'api_key_logs', 'api_keys', 'appointments', 'audit_log', 'audit_logs',
        'broker_profiles', 'broker_teams', 'broker_users', 'brokers', 'clients',
        'contacts', 'document_templates', 'documents', 'escrows', 'generated_documents',
        'leads', 'listing_price_history', 'listing_showings', 'listings', 'migrations',
        'onboarding_progress', 'refresh_tokens', 'security_events', 'teams',
        'user_profiles', 'users'
      ];

      if (!allowedTables.includes(tableName)) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_TABLE', message: 'Invalid table name' }
        });
      }

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_IDS', message: 'IDs array is required' }
        });
      }

      // Create placeholders for parameterized query
      const placeholders = ids.map((_, i) => `$${i + 1}`).join(',');

      const result = await pool.query(
        `DELETE FROM ${tableName} WHERE id IN (${placeholders}) RETURNING id`,
        ids
      );

      res.json({
        success: true,
        data: {
          deletedCount: result.rowCount,
          deletedIds: result.rows.map(r => r.id)
        }
      });
    } catch (error) {
      console.error('Delete rows error:', error);
      res.status(500).json({
        success: false,
        error: { code: 'DELETE_ROWS_ERROR', message: 'Failed to delete rows' }
      });
    }
  }

  /**
   * Delete all rows from table (DANGEROUS)
   */
  static async deleteAllRows(req, res) {
    try {
      const { tableName } = req.params;
      const { confirmation } = req.body; // Must pass "DELETE_ALL" as confirmation

      if (confirmation !== 'DELETE_ALL') {
        return res.status(400).json({
          success: false,
          error: { code: 'CONFIRMATION_REQUIRED', message: 'Confirmation string required' }
        });
      }

      // Whitelist validation
      const allowedTables = [
        'api_key_logs', 'api_keys', 'appointments', 'audit_log', 'audit_logs',
        'broker_profiles', 'broker_teams', 'broker_users', 'brokers', 'clients',
        'contacts', 'document_templates', 'documents', 'escrows', 'generated_documents',
        'leads', 'listing_price_history', 'listing_showings', 'listings', 'migrations',
        'onboarding_progress', 'refresh_tokens', 'security_events', 'teams',
        'user_profiles', 'users'
      ];

      if (!allowedTables.includes(tableName)) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_TABLE', message: 'Invalid table name' }
        });
      }

      const result = await pool.query(`DELETE FROM ${tableName} RETURNING id`);

      res.json({
        success: true,
        data: {
          deletedCount: result.rowCount
        }
      });
    } catch (error) {
      console.error('Delete all rows error:', error);
      res.status(500).json({
        success: false,
        error: { code: 'DELETE_ALL_ERROR', message: 'Failed to delete all rows' }
      });
    }
  }

  /**
   * Create new row in table
   */
  static async createRow(req, res) {
    try {
      const { tableName } = req.params;
      const rowData = req.body;

      // Whitelist validation
      const allowedTables = [
        'api_key_logs', 'api_keys', 'appointments', 'audit_log', 'audit_logs',
        'broker_profiles', 'broker_teams', 'broker_users', 'brokers', 'clients',
        'contacts', 'document_templates', 'documents', 'escrows', 'generated_documents',
        'leads', 'listing_price_history', 'listing_showings', 'listings', 'migrations',
        'onboarding_progress', 'refresh_tokens', 'security_events', 'teams',
        'user_profiles', 'users'
      ];

      if (!allowedTables.includes(tableName)) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_TABLE', message: 'Invalid table name' }
        });
      }

      if (!rowData || Object.keys(rowData).length === 0) {
        return res.status(400).json({
          success: false,
          error: { code: 'NO_DATA', message: 'Row data is required' }
        });
      }

      // Build INSERT query dynamically
      const columns = Object.keys(rowData);
      const values = Object.values(rowData);
      const placeholders = values.map((_, i) => `$${i + 1}`).join(',');

      const query = `
        INSERT INTO ${tableName} (${columns.join(',')})
        VALUES (${placeholders})
        RETURNING *
      `;

      const result = await pool.query(query, values);

      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Create row error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'CREATE_ROW_ERROR',
          message: error.message || 'Failed to create row'
        }
      });
    }
  }
}

module.exports = AdminController;
