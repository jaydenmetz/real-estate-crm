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

      // CRITICAL: Prevent self-deletion for auth-critical tables
      const currentUserId = req.user.id;

      // 1. Prevent deleting your own user account
      if (tableName === 'users' && ids.includes(currentUserId)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'CANNOT_DELETE_SELF',
            message: 'You cannot delete your own user account. Please ask another admin to delete your account.'
          }
        });
      }

      // 2. Prevent deleting your current refresh tokens (would cause instant logout)
      if (tableName === 'refresh_tokens') {
        // Get current user's active refresh tokens
        const currentTokens = await pool.query(
          'SELECT id FROM refresh_tokens WHERE user_id = $1 AND revoked_at IS NULL AND expires_at > NOW()',
          [currentUserId]
        );
        const currentTokenIds = currentTokens.rows.map(t => t.id);
        const attemptingToDeleteCurrent = ids.some(id => currentTokenIds.includes(id));

        if (attemptingToDeleteCurrent) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'CANNOT_DELETE_CURRENT_SESSION',
              message: 'You cannot delete your active session tokens. This would log you out. Use the "Logout" button instead, or delete other users\' tokens only.'
            }
          });
        }
      }

      // 3. Warn if deleting API key currently in use (if using API key auth)
      if (tableName === 'api_keys' && req.apiKeyId) {
        if (ids.includes(req.apiKeyId)) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'CANNOT_DELETE_CURRENT_API_KEY',
              message: 'You cannot delete the API key you are currently using. This would cause authentication errors. Please use a different authentication method first.'
            }
          });
        }
      }

      // Get the primary key column name for this table
      const primaryKeyMap = {
        teams: 'team_id',
        // Most tables use 'id' by default
      };
      const pkColumn = primaryKeyMap[tableName] || 'id';

      // Create placeholders for parameterized query
      const placeholders = ids.map((_, i) => `$${i + 1}`).join(',');

      const result = await pool.query(
        `DELETE FROM ${tableName} WHERE ${pkColumn} IN (${placeholders}) RETURNING ${pkColumn} as id`,
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

      // CRITICAL: Prevent deletion that would break current session
      const currentUserId = req.user.id;

      // 1. NEVER allow deleting all users (would delete yourself)
      if (tableName === 'users') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'CANNOT_DELETE_ALL_USERS',
            message: 'Deleting all users is not allowed. This would delete your own account and lock everyone out of the system. Delete users individually instead.'
          }
        });
      }

      // 2. For refresh_tokens, exclude current user's active tokens
      if (tableName === 'refresh_tokens') {
        // Delete all EXCEPT current user's active tokens
        const result = await pool.query(
          `DELETE FROM refresh_tokens
           WHERE NOT (user_id = $1 AND revoked_at IS NULL AND expires_at > NOW())
           RETURNING id`,
          [currentUserId]
        );

        return res.json({
          success: true,
          data: {
            deletedCount: result.rowCount,
            message: 'All refresh tokens deleted except your active sessions (to prevent auto-logout)'
          }
        });
      }

      // 3. For api_keys, exclude current API key if using API key auth
      if (tableName === 'api_keys' && req.apiKeyId) {
        const result = await pool.query(
          'DELETE FROM api_keys WHERE id != $1 RETURNING id',
          [req.apiKeyId]
        );

        return res.json({
          success: true,
          data: {
            deletedCount: result.rowCount,
            message: 'All API keys deleted except the one you are currently using (to prevent authentication errors)'
          }
        });
      }

      // 4. Compliance tables: Extra warning but allow deletion
      const complianceTables = ['security_events', 'audit_log', 'audit_logs'];
      if (complianceTables.includes(tableName)) {
        console.warn(`⚠️  COMPLIANCE WARNING: User ${currentUserId} deleted all rows from ${tableName}`);
        // Log this action to security events (if not deleting security_events itself)
        if (tableName !== 'security_events') {
          // Fire-and-forget security log
          pool.query(`
            INSERT INTO security_events (event_type, event_category, severity, user_id, ip_address, user_agent, request_path, request_method, success, message)
            VALUES ('compliance_data_deleted', 'account', 'critical', $1, $2, $3, $4, $5, true, $6)
          `, [
            currentUserId,
            req.ip || req.connection?.remoteAddress,
            req.headers['user-agent'],
            req.originalUrl,
            req.method,
            `User deleted all rows from ${tableName} table`
          ]).catch(console.error);
        }
      }

      // Get the primary key column name for this table
      const primaryKeyMap = {
        teams: 'team_id',
        // Most tables use 'id' by default
      };
      const pkColumn = primaryKeyMap[tableName] || 'id';

      // Safe to delete all rows for this table
      const result = await pool.query(`DELETE FROM ${tableName} RETURNING ${pkColumn} as id`);

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
