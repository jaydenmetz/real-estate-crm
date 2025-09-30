const { pool } = require('../config/database');

/**
 * Security Event Types
 */
const EventTypes = {
  // Authentication events
  LOGIN_SUCCESS: 'login_success',
  LOGIN_FAILED: 'login_failed',
  LOGOUT: 'logout',
  TOKEN_REFRESH: 'token_refresh',
  TOKEN_REFRESH_FAILED: 'token_refresh_failed',

  // Account lockout events
  ACCOUNT_LOCKED: 'account_locked',
  ACCOUNT_UNLOCKED: 'account_unlocked',
  LOCKOUT_ATTEMPT_WHILE_LOCKED: 'lockout_attempt_while_locked',

  // API Key events
  API_KEY_CREATED: 'api_key_created',
  API_KEY_USED: 'api_key_used',
  API_KEY_REVOKED: 'api_key_revoked',
  API_KEY_DELETED: 'api_key_deleted',
  API_KEY_EXPIRED: 'api_key_expired',

  // Authorization events
  INSUFFICIENT_SCOPE: 'insufficient_scope',
  PERMISSION_DENIED: 'permission_denied',
  ROLE_REQUIRED: 'role_required',

  // Account events
  PASSWORD_CHANGED: 'password_changed',
  EMAIL_CHANGED: 'email_changed',
  PROFILE_UPDATED: 'profile_updated',

  // Suspicious activity
  SUSPICIOUS_IP: 'suspicious_ip',
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
  INVALID_TOKEN: 'invalid_token',
  MULTIPLE_FAILED_LOGINS: 'multiple_failed_logins'
};

/**
 * Security Event Categories
 */
const EventCategories = {
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  API_KEY: 'api_key',
  ACCOUNT: 'account',
  SUSPICIOUS: 'suspicious'
};

/**
 * Event Severity Levels
 */
const Severity = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical'
};

/**
 * SecurityEventService - Handles logging of security-related events
 */
class SecurityEventService {
  /**
   * Log a security event
   * @param {Object} eventData - Event details
   * @returns {Promise<Object>} Created event record
   */
  static async logEvent({
    eventType,
    eventCategory,
    severity,
    userId = null,
    email = null,
    username = null,
    ipAddress = null,
    userAgent = null,
    requestPath = null,
    requestMethod = null,
    success = false,
    message = null,
    metadata = {},
    apiKeyId = null
  }) {
    try {
      const result = await pool.query(`
        INSERT INTO security_events (
          event_type, event_category, severity,
          user_id, email, username,
          ip_address, user_agent, request_path, request_method,
          success, message, metadata, api_key_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING id, event_type, created_at
      `, [
        eventType, eventCategory, severity,
        userId, email, username,
        ipAddress, userAgent, requestPath, requestMethod,
        success, message, JSON.stringify(metadata), apiKeyId
      ]);

      return result.rows[0];
    } catch (error) {
      // Don't throw - security logging should never break the application
      console.error('Failed to log security event:', error);
      return null;
    }
  }

  /**
   * Extract request context from Express request object
   */
  static extractRequestContext(req) {
    return {
      ipAddress: req.ip || req.connection?.remoteAddress || null,
      userAgent: req.headers['user-agent'] || null,
      requestPath: req.originalUrl || req.path || null,
      requestMethod: req.method || null
    };
  }

  /**
   * Extract user context from req.user
   */
  static extractUserContext(user) {
    if (!user) return { userId: null, email: null, username: null };

    return {
      userId: user.id || null,
      email: user.email || null,
      username: user.username || null
    };
  }

  // =====================
  // Convenience Methods
  // =====================

  /**
   * Log successful login
   */
  static async logLoginSuccess(req, user) {
    return this.logEvent({
      eventType: EventTypes.LOGIN_SUCCESS,
      eventCategory: EventCategories.AUTHENTICATION,
      severity: Severity.INFO,
      ...this.extractUserContext(user),
      ...this.extractRequestContext(req),
      success: true,
      message: 'User logged in successfully'
    });
  }

  /**
   * Log failed login attempt
   */
  static async logLoginFailed(req, emailOrUsername, reason = 'Invalid credentials') {
    return this.logEvent({
      eventType: EventTypes.LOGIN_FAILED,
      eventCategory: EventCategories.AUTHENTICATION,
      severity: Severity.WARNING,
      email: emailOrUsername.includes('@') ? emailOrUsername : null,
      username: !emailOrUsername.includes('@') ? emailOrUsername : null,
      ...this.extractRequestContext(req),
      success: false,
      message: reason,
      metadata: { attempted_identifier: emailOrUsername }
    });
  }

  /**
   * Log account lockout
   */
  static async logAccountLocked(req, user, lockedUntil, failedAttempts) {
    return this.logEvent({
      eventType: EventTypes.ACCOUNT_LOCKED,
      eventCategory: EventCategories.AUTHENTICATION,
      severity: Severity.ERROR,
      ...this.extractUserContext(user),
      ...this.extractRequestContext(req),
      success: false,
      message: `Account locked after ${failedAttempts} failed login attempts`,
      metadata: {
        locked_until: lockedUntil,
        failed_attempts: failedAttempts
      }
    });
  }

  /**
   * Log attempt to login while account is locked
   */
  static async logLockedAccountAttempt(req, user, minutesRemaining) {
    return this.logEvent({
      eventType: EventTypes.LOCKOUT_ATTEMPT_WHILE_LOCKED,
      eventCategory: EventCategories.SUSPICIOUS,
      severity: Severity.WARNING,
      ...this.extractUserContext(user),
      ...this.extractRequestContext(req),
      success: false,
      message: `Login attempt on locked account (${minutesRemaining} minutes remaining)`,
      metadata: { minutes_remaining: minutesRemaining }
    });
  }

  /**
   * Log token refresh
   */
  static async logTokenRefresh(req, user) {
    return this.logEvent({
      eventType: EventTypes.TOKEN_REFRESH,
      eventCategory: EventCategories.AUTHENTICATION,
      severity: Severity.INFO,
      ...this.extractUserContext(user),
      ...this.extractRequestContext(req),
      success: true,
      message: 'Access token refreshed'
    });
  }

  /**
   * Log API key creation
   */
  static async logApiKeyCreated(req, user, apiKeyId, keyName) {
    return this.logEvent({
      eventType: EventTypes.API_KEY_CREATED,
      eventCategory: EventCategories.API_KEY,
      severity: Severity.INFO,
      ...this.extractUserContext(user),
      ...this.extractRequestContext(req),
      apiKeyId: apiKeyId,
      success: true,
      message: `API key created: ${keyName}`,
      metadata: { key_name: keyName }
    });
  }

  /**
   * Log API key usage
   */
  static async logApiKeyUsed(req, user, apiKeyId) {
    // Only log first use or significant events to avoid spam
    // This is called from middleware, so we'll skip routine usage
    return this.logEvent({
      eventType: EventTypes.API_KEY_USED,
      eventCategory: EventCategories.API_KEY,
      severity: Severity.INFO,
      ...this.extractUserContext(user),
      ...this.extractRequestContext(req),
      apiKeyId: apiKeyId,
      success: true,
      message: 'API key used for authentication'
    });
  }

  /**
   * Log API key revocation
   */
  static async logApiKeyRevoked(req, user, apiKeyId, keyName) {
    return this.logEvent({
      eventType: EventTypes.API_KEY_REVOKED,
      eventCategory: EventCategories.API_KEY,
      severity: Severity.WARNING,
      ...this.extractUserContext(user),
      ...this.extractRequestContext(req),
      apiKeyId: apiKeyId,
      success: true,
      message: `API key revoked: ${keyName}`,
      metadata: { key_name: keyName }
    });
  }

  /**
   * Log insufficient scope error
   */
  static async logInsufficientScope(req, user, resource, action, requiredScope) {
    return this.logEvent({
      eventType: EventTypes.INSUFFICIENT_SCOPE,
      eventCategory: EventCategories.AUTHORIZATION,
      severity: Severity.WARNING,
      ...this.extractUserContext(user),
      ...this.extractRequestContext(req),
      apiKeyId: user?.apiKeyId || null,
      success: false,
      message: `Insufficient scope for ${resource}:${action}`,
      metadata: {
        resource,
        action,
        required_scope: requiredScope,
        user_scopes: user?.scopes || null
      }
    });
  }

  /**
   * Log rate limit exceeded
   */
  static async logRateLimitExceeded(req, limit, windowMs) {
    const user = req.user || {};
    return this.logEvent({
      eventType: EventTypes.RATE_LIMIT_EXCEEDED,
      eventCategory: EventCategories.SUSPICIOUS,
      severity: Severity.WARNING,
      ...this.extractUserContext(user),
      ...this.extractRequestContext(req),
      success: false,
      message: `Rate limit exceeded: ${limit} requests per ${windowMs}ms`,
      metadata: { limit, window_ms: windowMs }
    });
  }

  /**
   * Query security events with filters
   */
  static async queryEvents({
    userId = null,
    eventType = null,
    eventCategory = null,
    severity = null,
    startDate = null,
    endDate = null,
    success = null,
    ipAddress = null,
    limit = 100,
    offset = 0
  }) {
    const conditions = [];
    const params = [];
    let paramCount = 1;

    if (userId) {
      conditions.push(`user_id = $${paramCount++}`);
      params.push(userId);
    }

    if (eventType) {
      conditions.push(`event_type = $${paramCount++}`);
      params.push(eventType);
    }

    if (eventCategory) {
      conditions.push(`event_category = $${paramCount++}`);
      params.push(eventCategory);
    }

    if (severity) {
      conditions.push(`severity = $${paramCount++}`);
      params.push(severity);
    }

    if (startDate) {
      conditions.push(`created_at >= $${paramCount++}`);
      params.push(startDate);
    }

    if (endDate) {
      conditions.push(`created_at <= $${paramCount++}`);
      params.push(endDate);
    }

    if (success !== null) {
      conditions.push(`success = $${paramCount++}`);
      params.push(success);
    }

    if (ipAddress) {
      conditions.push(`ip_address = $${paramCount++}`);
      params.push(ipAddress);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT
        id, event_type, event_category, severity,
        user_id, email, username,
        ip_address, user_agent, request_path, request_method,
        success, message, metadata, api_key_id, created_at
      FROM security_events
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramCount++}
      OFFSET $${paramCount++}
    `;

    params.push(limit, offset);

    const result = await pool.query(query, params);
    return result.rows;
  }

  /**
   * Get event statistics
   */
  static async getEventStats(userId = null, daysBack = 30) {
    const params = [daysBack];
    const userFilter = userId ? `AND user_id = $2` : '';
    if (userId) params.push(userId);

    const result = await pool.query(`
      SELECT
        event_category,
        COUNT(*) as total_events,
        COUNT(*) FILTER (WHERE success = true) as successful_events,
        COUNT(*) FILTER (WHERE success = false) as failed_events,
        COUNT(*) FILTER (WHERE severity = 'critical') as critical_events,
        COUNT(*) FILTER (WHERE severity = 'error') as error_events,
        COUNT(*) FILTER (WHERE severity = 'warning') as warning_events
      FROM security_events
      WHERE created_at >= NOW() - INTERVAL '1 day' * $1
      ${userFilter}
      GROUP BY event_category
    `, params);

    return result.rows;
  }
}

// Export both the service and constants
module.exports = SecurityEventService;
module.exports.EventTypes = EventTypes;
module.exports.EventCategories = EventCategories;
module.exports.Severity = Severity;
