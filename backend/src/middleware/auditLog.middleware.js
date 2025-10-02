const winston = require('winston');
const { pool } = require('../config/database');

/**
 * Create audit logger with Winston
 */
const auditLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.File({
      filename: 'logs/audit.log',
      maxsize: 10485760, // 10MB
      maxFiles: 10,
    }),
    new winston.transports.File({
      filename: 'logs/audit-error.log',
      level: 'error',
      maxsize: 10485760,
      maxFiles: 5,
    }),
  ],
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  auditLogger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

/**
 * Log audit event to database
 */
const logToDatabase = async (auditData) => {
  try {
    const query = `
      INSERT INTO audit_logs (
        user_id,
        action,
        resource_type,
        resource_id,
        ip_address,
        user_agent,
        request_method,
        request_path,
        response_status,
        metadata,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
    `;

    await pool.query(query, [
      auditData.userId,
      auditData.action,
      auditData.resourceType,
      auditData.resourceId,
      auditData.ipAddress,
      auditData.userAgent,
      auditData.method,
      auditData.path,
      auditData.status,
      JSON.stringify(auditData.metadata || {}),
    ]);
  } catch (error) {
    // Log to file if database write fails
    auditLogger.error('Failed to write audit log to database', { error: error.message, auditData });
  }
};

/**
 * Determine action type from HTTP method
 */
const getActionType = (method, path) => {
  if (method === 'GET') return 'READ';
  if (method === 'POST') {
    if (path.includes('login')) return 'LOGIN';
    if (path.includes('register')) return 'REGISTER';
    return 'CREATE';
  }
  if (method === 'PUT' || method === 'PATCH') return 'UPDATE';
  if (method === 'DELETE') return 'DELETE';
  return 'OTHER';
};

/**
 * Extract resource info from path
 */
const extractResourceInfo = (path) => {
  // Match patterns like /v1/escrows/123 or /api/users/456
  const match = path.match(/\/(v\d+|api)\/([^\/]+)\/([^\/\?]+)/);
  if (match) {
    return {
      resourceType: match[2].toUpperCase(),
      resourceId: match[3],
    };
  }

  // Match patterns like /v1/escrows or /api/users
  const simpleMatch = path.match(/\/(v\d+|api)\/([^\/\?]+)/);
  if (simpleMatch) {
    return {
      resourceType: simpleMatch[2].toUpperCase(),
      resourceId: null,
    };
  }

  return {
    resourceType: 'UNKNOWN',
    resourceId: null,
  };
};

/**
 * Audit logging middleware
 */
const auditLog = (options = {}) => async (req, res, next) => {
  // Skip logging for health checks and static assets
  if (req.path.includes('/health') || req.path.includes('/static') || req.path.includes('/uploads')) {
    return next();
  }

  const startTime = Date.now();
  const { resourceType, resourceId } = extractResourceInfo(req.path);

  // Capture original end function
  const originalEnd = res.end;

  // Override end function to capture response
  res.end = function (...args) {
    // Restore original end function
    res.end = originalEnd;

    // Call original end function
    res.end.apply(res, args);

    // Log audit data
    const auditData = {
      userId: req.user?.id || req.apiKey?.user_id || null,
      action: getActionType(req.method, req.path),
      resourceType,
      resourceId,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: Date.now() - startTime,
      metadata: {
        query: req.query,
        teamId: req.headers['x-team-id'],
        apiKeyId: req.apiKey?.id,
        responseSize: res.get('Content-Length'),
      },
    };

    // Log to file
    auditLogger.info('API Request', auditData);

    // Log sensitive operations to database
    if (options.logToDatabase !== false) {
      const sensitiveActions = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'REGISTER'];
      const sensitiveResources = ['USERS', 'ESCROWS', 'API_KEYS', 'TEAMS', 'BROKERS'];

      if (sensitiveActions.includes(auditData.action)
            || sensitiveResources.includes(auditData.resourceType)) {
        logToDatabase(auditData);
      }
    }
  };

  next();
};

/**
 * Security event logger for critical events
 */
const logSecurityEvent = (eventType, details) => {
  const securityData = {
    eventType,
    timestamp: new Date().toISOString(),
    ...details,
  };

  auditLogger.error('SECURITY_EVENT', securityData);

  // Always log security events to database
  logToDatabase({
    userId: details.userId,
    action: `SECURITY_${eventType}`,
    resourceType: 'SECURITY',
    resourceId: null,
    ipAddress: details.ipAddress,
    userAgent: details.userAgent,
    method: details.method,
    path: details.path,
    status: details.status,
    metadata: details,
  });
};

module.exports = {
  auditLog,
  logSecurityEvent,
  auditLogger,
};
